#!/bin/bash

# Wait for RDS to be available and complete setup

echo "Checking RDS instance status..."
STATUS=$(aws rds describe-db-instances \
  --db-instance-identifier crossword-db \
  --profile personal \
  --region us-east-1 \
  --query 'DBInstances[0].DBInstanceStatus' \
  --output text)

if [ "$STATUS" != "available" ]; then
  echo "RDS instance is still creating (status: $STATUS)"
  echo "Run this script again in a few minutes, or use:"
  echo "  aws rds wait db-instance-available --db-instance-identifier crossword-db --profile personal --region us-east-1"
  exit 1
fi

echo "✓ RDS instance is available!"

# Get endpoint
ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier crossword-db \
  --profile personal \
  --region us-east-1 \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "✓ Database endpoint: $ENDPOINT"

# Create connection string
CONNECTION_STRING="mysql://admin:CrosswordDB2024!@${ENDPOINT}:3306/crossword"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RDS MySQL Database Created Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Database Details:"
echo "  Identifier: crossword-db"
echo "  Endpoint:   $ENDPOINT"
echo "  Port:       3306"
echo "  Database:   crossword"
echo "  Username:   admin"
echo "  Password:   CrosswordDB2024!"
echo ""
echo "Connection String:"
echo "  $CONNECTION_STRING"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next Steps:"
echo ""
echo "1. Create database tables:"
echo "   mysql -h $ENDPOINT -u admin -p'CrosswordDB2024!' crossword < scripts/setup-sql-database.sql"
echo ""
echo "2. Set Amplify secret:"
echo "   npx ampx sandbox secret set SQL_CONNECTION_STRING"
echo "   (paste the connection string above when prompted)"
echo ""
echo "3. Generate TypeScript schema:"
echo "   npx ampx generate schema-from-database --connection-uri-secret SQL_CONNECTION_STRING --out amplify/data/schema.sql.ts"
echo ""
echo "4. Start sandbox:"
echo "   npx ampx sandbox"
echo ""
echo "5. Migrate data:"
echo "   npm run migrate-to-sql"
echo ""
