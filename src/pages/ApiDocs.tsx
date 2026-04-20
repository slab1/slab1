import React from 'react';
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ExternalLink, ShieldCheck, Code2, Book, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApiDocs: React.FC = () => {
  const navigate = useNavigate();
  const specUrl = "https://reewcfpjlnufktvahtii.supabase.co/functions/v1/external-api/doc";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900">API Documentation</h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-green-500" />
                Reservatoo External API
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2" asChild>
              <a href={specUrl} target="_blank" rel="noreferrer">
                <Code2 className="h-4 w-4" />
                OpenAPI Spec
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            </Button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>
            <Button variant="default" size="sm" className="bg-slate-900 hover:bg-slate-800" onClick={() => window.print()}>
              Print Docs
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Intro Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Quick Integration</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Use our RESTful API to manage restaurants, locations, and real-time reservations.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Secure Auth</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Authenticated via API keys with granular permissions and usage quotas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
              <Book className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Interactive UI</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Test endpoints directly from this documentation using your generated API keys.
            </p>
          </div>
        </div>

        {/* Swagger UI Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden custom-swagger">
          <style dangerouslySetInnerHTML={{ __html: `
            .custom-swagger .swagger-ui {
              font-family: inherit;
            }
            .custom-swagger .swagger-ui .topbar {
              display: none;
            }
            .custom-swagger .swagger-ui .info {
              margin: 30px 0;
              padding: 0 20px;
            }
            .custom-swagger .swagger-ui .info .title {
              font-size: 24px;
              color: #0f172a;
            }
            .custom-swagger .swagger-ui .scheme-container {
              background: #f8fafc;
              padding: 20px;
              margin: 0;
              box-shadow: none;
              border-bottom: 1px solid #e2e8f0;
            }
            .custom-swagger .swagger-ui .opblock-tag-section {
              padding: 0 20px;
            }
            .custom-swagger .swagger-ui .opblock {
              border-radius: 8px;
              box-shadow: none;
              border: 1px solid #e2e8f0;
            }
            .custom-swagger .swagger-ui .opblock .opblock-summary {
              padding: 12px 16px;
            }
            .custom-swagger .swagger-ui .btn.authorize {
              border-color: #0f172a;
              color: #0f172a;
            }
            .custom-swagger .swagger-ui .btn.authorize svg {
              fill: #0f172a;
            }
          `}} />
          <SwaggerUI 
            url={specUrl} 
            docExpansion="list"
            persistAuthorization={true}
            supportedSubmitMethods={['get', 'post', 'put', 'delete', 'patch']}
            requestInterceptor={(req: Record<string, unknown>) => {
              return req;
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Reservatoo. Built with ❤️ for developers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ApiDocs;
