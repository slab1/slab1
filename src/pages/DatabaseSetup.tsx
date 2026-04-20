import { DatabaseManager } from "@/components/admin/database/DatabaseManager";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function DatabaseSetup() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/admin')} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-2xl font-bold">Advanced Database Setup</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
        
        <DatabaseManager />
      </div>
    </div>
  );
}
