import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface RecordFormProps {
  open: boolean;
  onClose: () => void;
  tableName: string;
  record: any | null; // null for Create, object for Update
  columns: string[];
  onSave: (data: any) => void;
  isSaving: boolean;
}

export function RecordForm({
  open,
  onClose,
  tableName,
  record,
  columns,
  onSave,
  isSaving
}: RecordFormProps) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (record) {
      setFormData(record);
    } else {
      setFormData({});
    }
  }, [record, open]);

  const handleChange = (column: string, value: any) => {
    setFormData(prev => ({ ...prev, [column]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Exclude auto-generated columns for Create
  const displayColumns = record 
    ? columns 
    : columns.filter(col => !['id', 'created_at', 'updated_at'].includes(col));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{record ? 'Edit Record' : 'Add New Record'}</DialogTitle>
            <DialogDescription>
              {record ? `Update record in ${tableName}` : `Insert a new row into ${tableName}`}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px] mt-4 pr-4">
            <div className="space-y-4 py-2">
              {displayColumns.map(col => {
                const value = formData[col];
                const isId = col === 'id';
                const isReadOnly = record && isId;

                return (
                  <div key={col} className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={col} className="text-right font-mono text-xs truncate">
                      {col}
                    </Label>
                    <div className="col-span-3">
                      {typeof value === 'boolean' ? (
                        <Switch
                          id={col}
                          checked={!!value}
                          onCheckedChange={(checked) => handleChange(col, checked)}
                          disabled={isReadOnly}
                        />
                      ) : col.includes('description') || col.includes('notes') ? (
                        <Textarea
                          id={col}
                          value={value || ''}
                          onChange={(e) => handleChange(col, e.target.value)}
                          disabled={isReadOnly}
                          className="text-xs"
                        />
                      ) : (
                        <Input
                          id={col}
                          value={value === null || value === undefined ? '' : String(value)}
                          onChange={(e) => handleChange(col, e.target.value)}
                          disabled={isReadOnly}
                          className="text-xs font-mono"
                          placeholder={isId ? 'Auto-generated' : ''}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
