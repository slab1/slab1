import React, { useState } from 'react';
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
import { Plus, Trash2, Shield, Settings2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ColumnDefinition {
  name: string;
  type: string;
  isPrimary: boolean;
  isNullable: boolean;
  default: string;
}

interface TableEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (sql: string) => void;
}

export function TableEditor({ open, onClose, onSave }: TableEditorProps) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<ColumnDefinition[]>([
    { name: 'id', type: 'uuid', isPrimary: true, isNullable: false, default: 'gen_random_uuid()' },
    { name: 'created_at', type: 'timestamp with time zone', isPrimary: false, isNullable: false, default: 'now()' }
  ]);

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'text', isPrimary: false, isNullable: true, default: '' }]);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, field: keyof ColumnDefinition, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const generateSql = () => {
    const columnSql = columns.map(col => {
      let sql = `  ${col.name} ${col.type}`;
      if (col.isPrimary) sql += ' PRIMARY KEY';
      if (!col.isNullable) sql += ' NOT NULL';
      if (col.default) sql += ` DEFAULT ${col.default}`;
      return sql;
    }).join(',\n');

    return `CREATE TABLE public.${tableName} (\n${columnSql}\n);`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName) return;
    onSave(generateSql());
  };

  const dataTypes = [
    'uuid', 'text', 'varchar', 'integer', 'bigint', 'boolean', 
    'numeric', 'timestamp with time zone', 'jsonb', 'date'
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Table</DialogTitle>
            <DialogDescription>
              Define the schema for your new database table.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tableName" className="text-right">Table Name</Label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="e.g. customer_feedback"
                className="col-span-3"
                required
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Columns</h4>
                <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                  <Plus className="h-4 w-4 mr-2" /> Add Column
                </Button>
              </div>

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {columns.map((col, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-lg bg-accent/5">
                      <div className="col-span-3 space-y-1">
                        <Label className="text-[10px]">Column Name</Label>
                        <Input
                          value={col.name}
                          onChange={(e) => updateColumn(index, 'name', e.target.value)}
                          placeholder="column_name"
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-[10px]">Data Type</Label>
                        <Select
                          value={col.type}
                          onValueChange={(val) => updateColumn(index, 'type', val)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dataTypes.map(type => (
                              <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-1 flex flex-col items-center justify-center">
                        <Label className="text-[10px]">PK</Label>
                        <Switch
                          checked={col.isPrimary}
                          onCheckedChange={(val) => updateColumn(index, 'isPrimary', val)}
                        />
                      </div>
                      <div className="col-span-2 space-y-1 flex flex-col items-center justify-center">
                        <Label className="text-[10px]">Null</Label>
                        <Switch
                          checked={col.isNullable}
                          onCheckedChange={(val) => updateColumn(index, 'isNullable', val)}
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeColumn(index)}
                          disabled={columns.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="col-span-12 space-y-1">
                        <Label className="text-[10px]">Default Value (Optional)</Label>
                        <Input
                          value={col.default}
                          onChange={(e) => updateColumn(index, 'default', e.target.value)}
                          placeholder="e.g. now() or 'active'"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Generate & Run SQL</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const Separator = () => <div className="h-[1px] bg-border w-full my-4" />;
