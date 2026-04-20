import { Hono } from "https://esm.sh/hono@4.4.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// --- Types ---
type Variables = {
  key_id: string;
  user_id: string;
  scopes: string[];
};

// --- App Setup ---
const app = new Hono<{ Variables: Variables }>().basePath("/external-api");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-KEY, Authorization",
};

app.options("*", (c) => c.body(null, 204, corsHeaders));

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  { auth: { persistSession: false } }
);

// --- Helper: hash API key ---
async function hashKey(apiKey: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- Middleware: API Key Auth (only for /v1/* except /v1/health) ---
app.use("/v1/*", async (c, next) => {
  Object.entries(corsHeaders).forEach(([k, v]) => c.header(k, v));

  // Skip auth for health endpoint
  if (c.req.path.endsWith("/v1/health")) {
    return next();
  }

  const apiKey = c.req.header("X-API-KEY");
  if (!apiKey) {
    return c.json({ error: "API Key missing" }, 401);
  }

  const hashHex = await hashKey(apiKey);

  const { data: keyData, error: keyError } = await supabaseAdmin
    .from("api_keys")
    .select("id, user_id, scopes, is_active, request_count, monthly_quota, expires_at, allowed_ips")
    .eq("key_hash", hashHex)
    .single();

  if (keyError || !keyData) {
    return c.json({ error: "Invalid API Key" }, 401);
  }

  if (!keyData.is_active) {
    return c.json({ error: "API Key is inactive" }, 403);
  }

  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return c.json({ error: "API Key has expired" }, 403);
  }

  if (keyData.allowed_ips && keyData.allowed_ips.length > 0) {
    const clientIp = c.req.header("x-forwarded-for")?.split(",")[0].trim() || c.req.header("remote-addr");
    if (clientIp && !keyData.allowed_ips.includes(clientIp)) {
      return c.json({ error: "IP address not whitelisted" }, 403);
    }
  }

  if (keyData.request_count >= keyData.monthly_quota) {
    return c.json({ error: "Monthly quota exceeded" }, 429);
  }

  c.set("key_id", keyData.id);
  c.set("user_id", keyData.user_id);
  c.set("scopes", keyData.scopes || []);

  // Update usage asynchronously
  supabaseAdmin
    .from("api_keys")
    .update({
      last_used_at: new Date().toISOString(),
      request_count: (keyData.request_count || 0) + 1,
    })
    .eq("id", keyData.id)
    .then(() => {});

  supabaseAdmin
    .from("api_usage_logs")
    .insert({
      api_key_id: keyData.id,
      endpoint: c.req.path,
      method: c.req.method,
      status_code: 200,
      user_id: keyData.user_id,
    })
    .then(() => {});

  await next();
});

// ===========================
// ROUTES
// ===========================

// --- Health (public, no auth) ---
app.get("/v1/health", (c) => {
  Object.entries(corsHeaders).forEach(([k, v]) => c.header(k, v));
  return c.json({
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// --- GET /v1/restaurants ---
app.get("/v1/restaurants", async (c) => {
  const { data, error } = await supabaseAdmin
    .from("restaurants")
    .select("id, name, address, cuisine_type, rating")
    .limit(50);

  if (error) return c.json({ error: error.message }, 500);

  const restaurants = (data || []).map((r) => ({
    id: r.id,
    name: r.name,
    address: r.address,
    cuisine: r.cuisine_type,
    rating: r.rating || 0,
  }));

  return c.json(restaurants);
});

// --- GET /v1/restaurants/:id ---
app.get("/v1/restaurants/:id", async (c) => {
  const id = c.req.param("id");

  const { data, error } = await supabaseAdmin
    .from("restaurants")
    .select("id, name, address, cuisine_type, rating")
    .eq("id", id)
    .single();

  if (error || !data) return c.json({ error: "Restaurant not found" }, 404);

  return c.json({
    id: data.id,
    name: data.name,
    address: data.address,
    cuisine: data.cuisine_type,
    rating: data.rating || 0,
  });
});

// --- GET /v1/reservations ---
app.get("/v1/reservations", async (c) => {
  const restaurantId = c.req.query("restaurant_id");
  const date = c.req.query("date");
  const status = c.req.query("status");
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = parseInt(c.req.query("offset") || "0");

  let query = supabaseAdmin
    .from("reservations")
    .select("id, restaurant_id, guest_name, party_size, date, time, status, created_at")
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (restaurantId) query = query.eq("restaurant_id", restaurantId);
  if (date) query = query.eq("date", date);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) return c.json({ error: error.message }, 500);

  return c.json({ data: data || [], count: (data || []).length, limit, offset });
});

// --- POST /v1/reservations ---
app.post("/v1/reservations", async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { restaurant_id, guest_name, party_size, date, time } = body as {
    restaurant_id?: string;
    guest_name?: string;
    party_size?: number;
    date?: string;
    time?: string;
  };

  if (!restaurant_id || !guest_name || !party_size || !date || !time) {
    return c.json({ error: "Missing required fields: restaurant_id, guest_name, party_size, date, time" }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from("reservations")
    .insert({
      restaurant_id,
      guest_name,
      party_size,
      date,
      time,
      status: "confirmed",
      user_id: c.get("user_id"),
    })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);

  return c.json(data, 201);
});

// --- GET /v1/tables ---
app.get("/v1/tables", async (c) => {
  const locationId = c.req.query("location_id");
  const restaurantId = c.req.query("restaurant_id");

  let query = supabaseAdmin
    .from("tables")
    .select("id, name, capacity, status, restaurant_id")
    .limit(50);

  if (locationId) query = query.eq("restaurant_location_id", locationId);
  if (restaurantId) query = query.eq("restaurant_id", restaurantId);

  const { data, error } = await query;

  if (error) return c.json({ error: error.message }, 500);

  return c.json(data || []);
});

// ===========================
// OpenAPI SPEC
// ===========================
app.get("/doc", (c) => {
  Object.entries(corsHeaders).forEach(([k, v]) => c.header(k, v));

  const spec = {
    openapi: "3.0.0",
    info: {
      title: "Reservatoo External API",
      version: "1.0.0",
      description: "External API for third-party integrations with Reservatoo SaaS. Manage restaurants, reservations, and tables programmatically.",
    },
    servers: [
      {
        url: "https://reewcfpjlnufktvahtii.supabase.co/functions/v1/external-api",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-KEY",
          description: "API key generated from the Developer Portal",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Unauthorized" },
          },
        },
        Restaurant: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "The Gourmet Kitchen" },
            address: { type: "string", example: "123 Foodie St" },
            cuisine: { type: "string", example: "Italian" },
            rating: { type: "number", example: 4.8 },
          },
        },
        Reservation: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            restaurant_id: { type: "string", format: "uuid" },
            guest_name: { type: "string" },
            party_size: { type: "integer" },
            date: { type: "string", format: "date" },
            time: { type: "string" },
            status: { type: "string", enum: ["confirmed", "pending", "cancelled"] },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Table: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            capacity: { type: "integer" },
            status: { type: "string" },
            restaurant_id: { type: "string", format: "uuid" },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "healthy" },
            version: { type: "string", example: "1.0.0" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
    tags: [
      { name: "Health", description: "System health checks" },
      { name: "Restaurants", description: "Restaurant management" },
      { name: "Reservations", description: "Reservation management" },
      { name: "Tables", description: "Table management" },
    ],
    paths: {
      "/v1/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          description: "Returns API health status. No authentication required.",
          responses: {
            "200": {
              description: "API is healthy",
              content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } } },
            },
          },
        },
      },
      "/v1/restaurants": {
        get: {
          tags: ["Restaurants"],
          summary: "List all restaurants",
          description: "Returns a list of all active restaurants.",
          security: [{ ApiKeyAuth: [] }],
          responses: {
            "200": {
              description: "List of restaurants",
              content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Restaurant" } } } },
            },
            "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/v1/restaurants/{id}": {
        get: {
          tags: ["Restaurants"],
          summary: "Get restaurant by ID",
          description: "Returns detailed information about a single restaurant.",
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            "200": {
              description: "Restaurant details",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Restaurant" } } },
            },
            "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/v1/reservations": {
        get: {
          tags: ["Reservations"],
          summary: "List reservations",
          description: "Returns paginated reservations. Filter by restaurant_id, date, or status.",
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            { name: "restaurant_id", in: "query", schema: { type: "string", format: "uuid" } },
            { name: "date", in: "query", schema: { type: "string", format: "date" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["confirmed", "pending", "cancelled"] } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
            { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
          ],
          responses: {
            "200": {
              description: "Paginated reservations",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { type: "array", items: { $ref: "#/components/schemas/Reservation" } },
                      count: { type: "integer" },
                      limit: { type: "integer" },
                      offset: { type: "integer" },
                    },
                  },
                },
              },
            },
            "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        post: {
          tags: ["Reservations"],
          summary: "Create a reservation",
          description: "Creates a new reservation for a restaurant.",
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["restaurant_id", "guest_name", "party_size", "date", "time"],
                  properties: {
                    restaurant_id: { type: "string", format: "uuid" },
                    guest_name: { type: "string", example: "Jane Doe" },
                    party_size: { type: "integer", example: 4 },
                    date: { type: "string", format: "date", example: "2026-04-10" },
                    time: { type: "string", example: "19:00" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Reservation created",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Reservation" } } },
            },
            "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/v1/tables": {
        get: {
          tags: ["Tables"],
          summary: "List tables",
          description: "Returns tables for a restaurant or location.",
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            { name: "restaurant_id", in: "query", schema: { type: "string", format: "uuid" } },
            { name: "location_id", in: "query", schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            "200": {
              description: "List of tables",
              content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Table" } } } },
            },
            "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
    },
  };

  return c.json(spec);
});

// Swagger UI redirect
app.get("/swagger-ui", (c) => {
  Object.entries(corsHeaders).forEach(([k, v]) => c.header(k, v));
  const html = `<!DOCTYPE html>
<html><head><title>Reservatoo API</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head><body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({url:"/functions/v1/external-api/doc",dom_id:"#swagger-ui",persistAuthorization:true})</script>
</body></html>`;
  return c.html(html);
});

// --- Serve ---
Deno.serve(app.fetch);
