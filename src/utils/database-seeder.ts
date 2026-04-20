import { supabase } from '@/integrations/supabase/client';
import { ENV_SEED_DATA, SEED_DATA } from './seed-data';

export interface SeederOptions {
  dryRun?: boolean;
  selectiveTables?: string[];
  environment?: 'development' | 'testing' | 'production';
  onProgress?: (message: string, progress: number) => void;
  conflictResolution?: 'upsert' | 'error';
}

export interface SeederResult {
  success: boolean;
  logs: string[];
  error?: any;
}

export class DatabaseSeeder {
  private logs: string[] = [];
  private options: SeederOptions = {};
  private currentSeedData: any = SEED_DATA;

  private log(message: string) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;
    this.logs.push(formattedMessage);
    console.log(formattedMessage);
    if (this.options.onProgress) {
      this.options.onProgress(message, 0); // Progress calculation can be refined
    }
  }

  async seedDatabase(options: SeederOptions = {}): Promise<SeederResult> {
    this.options = {
      dryRun: false,
      conflictResolution: 'upsert',
      environment: 'development',
      ...options
    };
    
    this.currentSeedData = ENV_SEED_DATA[this.options.environment!] || SEED_DATA;
    this.logs = [];
    
    this.log(`Starting database seeding in ${this.options.environment} environment${this.options.dryRun ? ' (DRY RUN)' : ''}...`);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required for seeding');

      // Validate data before execution
      this.validateData();

      // Table order for seeding (respecting foreign keys)
      const tableOrder = [
        { name: 'profiles', data: this.currentSeedData.profiles, method: this.seedGeneric.bind(this) },
        { name: 'user_roles', data: this.currentSeedData.user_roles, method: this.seedGeneric.bind(this) },
        { name: 'restaurants', data: this.currentSeedData.restaurants, method: this.seedGeneric.bind(this) },
        { name: 'restaurant_locations', data: this.currentSeedData.locations, method: this.seedGeneric.bind(this) },
        { name: 'tables', data: this.currentSeedData.tables || [], method: this.seedGeneric.bind(this) },
        { name: 'menu_categories', data: this.currentSeedData.menuCategories, method: this.seedGeneric.bind(this) },
        { name: 'menu_items', data: this.currentSeedData.menuItems, method: this.seedGeneric.bind(this) },
        { name: 'ingredients', data: this.currentSeedData.ingredients, method: this.seedGeneric.bind(this) },
        { name: 'stock_levels', data: this.currentSeedData.stock_levels, method: this.seedGeneric.bind(this) },
        { name: 'chefs', data: this.currentSeedData.chefs, method: this.seedGeneric.bind(this) }
      ];

      for (let i = 0; i < tableOrder.length; i++) {
        const { name, data, method } = tableOrder[i];
        
        // Skip if selectiveTables is provided and table is not included
        if (this.options.selectiveTables && !this.options.selectiveTables.includes(name)) {
          this.log(`Skipping table: ${name}`);
          continue;
        }

        // Skip if no data for this table in this environment
        if (!data || data.length === 0) {
          this.log(`No data to seed for table: ${name}`);
          continue;
        }

        const progress = Math.round(((i + 1) / tableOrder.length) * 100);
        this.log(`Seeding table: ${name}...`);
        
        await method(name, data);
        
        if (this.options.onProgress) {
          this.options.onProgress(`Completed ${name}`, progress);
        }
      }

      this.log('Database seeding completed successfully!');
      
      // Audit log the operation
      await this.createAuditLog(user.id, 'seed_database', { 
        dryRun: this.options.dryRun, 
        selectiveTables: this.options.selectiveTables,
        environment: this.options.environment
      });

      return { success: true, logs: this.logs };
    } catch (error: any) {
      this.log(`CRITICAL ERROR: ${error.message}`);
      return { success: false, logs: this.logs, error };
    }
  }

  private validateData() {
    this.log(`Validating seed data integrity for ${this.options.environment} environment...`);
    
    const requiredTables = ['profiles', 'restaurants', 'locations', 'tables'];
    const missingTables = requiredTables.filter(table => {
      const key = table === 'locations' ? 'locations' : table;
      return !(this.currentSeedData as any)[key];
    });
    
    if (this.options.environment !== 'production' && missingTables.length > 0) {
      throw new Error(`Seed data is missing critical tables: ${missingTables.join(', ')}`);
    }

    // Basic foreign key integrity checks
    if (this.currentSeedData.restaurants?.length > 0) {
      const restaurantIds = new Set(this.currentSeedData.restaurants.map((r: any) => r.id));
      
      // Validate locations
      this.currentSeedData.locations?.forEach((loc: any, index: number) => {
        if (!restaurantIds.has(loc.restaurant_id)) {
          this.log(`Warning: Location at index ${index} references non-existent restaurant ${loc.restaurant_id}`);
        }
      });

      // Validate tables
      this.currentSeedData.tables?.forEach((table: any, index: number) => {
        if (!restaurantIds.has(table.restaurant_id)) {
          this.log(`Warning: Table ${table.table_number} at index ${index} references non-existent restaurant ${table.restaurant_id}`);
        }
      });

      // Validate menu categories
      this.currentSeedData.menuCategories?.forEach((cat: any, index: number) => {
        if (!restaurantIds.has(cat.restaurant_id)) {
          this.log(`Warning: Menu category ${cat.name} at index ${index} references non-existent restaurant ${cat.restaurant_id}`);
        }
      });
    }

    this.log('Validation successful.');
  }

  private async seedGeneric(tableName: string, data: any[]): Promise<void> {
    if (this.options.dryRun) {
      this.log(`[DRY RUN] Would upsert ${data.length} records into ${tableName}`);
      return;
    }

    const { error } = await supabase.from(tableName as any).upsert(data);
    
    if (error) {
      this.log(`Error seeding ${tableName}: ${error.message}`);
      if (this.options.conflictResolution === 'error') {
        throw error;
      }
    } else {
      this.log(`Successfully seeded ${data.length} records into ${tableName}`);
    }
  }

  private async createAuditLog(userId: string, action: string, details: any) {
    if (this.options.dryRun) return;

    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: action,
        event_type: 'system_operation',
        table_name: 'multiple',
        new_data: details,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Failed to create audit log for seeding:', err);
    }
  }

  async clearExistingData(selectiveTables?: string[]): Promise<void> {
    this.log('Clearing existing data...');
    
    // Delete in reverse order of dependencies
    const allTables = [
      'chefs',
      'stock_levels',
      'ingredients',
      'menu_items',
      'menu_categories', 
      'restaurant_locations',
      'restaurants',
      'user_roles'
    ];

    const tablesToDelete = selectiveTables || allTables;

    for (const tableName of tablesToDelete) {
      if (this.options.dryRun) {
        this.log(`[DRY RUN] Would clear table: ${tableName}`);
        continue;
      }

      try {
        // Use a safe delete with a filter to satisfy RLS/PostgREST requirements
        const { error } = await supabase.from(tableName as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
        this.log(`Cleared table: ${tableName}`);
      } catch (error: any) {
        this.log(`Could not clear table ${tableName}: ${error.message}`);
      }
    }
  }
}

export const databaseSeeder = new DatabaseSeeder();
