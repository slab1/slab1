// Note: In a real project, we would use Jest and React Testing Library
// For this environment, we'll demonstrate the logic validation

export const validateSqlGeneration = (tableName: string, columns: any[]) => {
  if (!tableName) return { success: false, error: 'Table name is required' };
  if (columns.length === 0) return { success: false, error: 'At least one column is required' };

  const columnSql = columns.map(col => {
    let sql = `  ${col.name} ${col.type}`;
    if (col.isPrimary) sql += ' PRIMARY KEY';
    if (!col.isNullable) sql += ' NOT NULL';
    if (col.default) sql += ` DEFAULT ${col.default}`;
    return sql;
  }).join(',\n');

  const generatedSql = `CREATE TABLE public.${tableName} (\n${columnSql}\n);`;
  
  return {
    success: true,
    sql: generatedSql
  };
};

// Simple test cases
const runTests = () => {
  const tests = [
    {
      name: 'Basic table creation',
      input: {
        name: 'test_table',
        columns: [{ name: 'id', type: 'uuid', isPrimary: true, isNullable: false, default: 'gen_random_uuid()' }]
      },
      expected: /CREATE TABLE public.test_table/
    },
    {
      name: 'Multi-column table',
      input: {
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isNullable: false },
          { name: 'email', type: 'text', isPrimary: false, isNullable: false },
          { name: 'age', type: 'integer', isPrimary: false, isNullable: true }
        ]
      },
      expected: /email text NOT NULL/
    }
  ];

  tests.forEach(test => {
    const result = validateSqlGeneration(test.input.name, test.input.columns);
    if (result.success && test.expected.test(result.sql!)) {
      console.log(`✅ Test passed: ${test.name}`);
    } else {
      console.error(`❌ Test failed: ${test.name}`);
    }
  });
};

// runTests();
