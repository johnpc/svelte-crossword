# RDS MySQL Database Setup

## Database Created ✓

Your RDS MySQL database has been provisioned with the following configuration:

### Database Details

- **Identifier**: `crossword-db`
- **Engine**: MySQL 8.0.39
- **Instance Class**: db.t3.micro (1 vCPU, 1GB RAM)
- **Storage**: 20GB gp2
- **Region**: us-east-1
- **Status**: Creating (takes 5-10 minutes)

### Credentials

- **Username**: `admin`
- **Password**: `CrosswordDB2024!`
- **Database Name**: `crossword`

### Network Configuration

- **VPC**: vpc-0c3b2774578688767 (default VPC)
- **Subnets**: us-east-1a, us-east-1b
- **Security Group**: sg-0ef26905b1935bd1e
- **Publicly Accessible**: Yes
- **Port**: 3306

## Wait for Database to be Ready

The database is currently being created. Check status with:

```bash
aws rds describe-db-instances \
  --db-instance-identifier crossword-db \
  --profile personal \
  --region us-east-1 \
  --query 'DBInstances[0].DBInstanceStatus'
```

Or wait automatically:

```bash
aws rds wait db-instance-available \
  --db-instance-identifier crossword-db \
  --profile personal \
  --region us-east-1
```

## Complete Setup

Once the database is available, run:

```bash
./scripts/complete-sql-setup.sh
```

This will:

1. Get the database endpoint
2. Display connection details
3. Show next steps for creating tables and integrating with Amplify

## Manual Steps (if needed)

### 1. Get Database Endpoint

```bash
aws rds describe-db-instances \
  --db-instance-identifier crossword-db \
  --profile personal \
  --region us-east-1 \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

### 2. Create Tables

```bash
mysql -h <ENDPOINT> -u admin -p'CrosswordDB2024!' crossword < scripts/setup-sql-database.sql
```

### 3. Set Amplify Secret

```bash
npx ampx sandbox secret set SQL_CONNECTION_STRING
# Enter: mysql://admin:CrosswordDB2024!@<ENDPOINT>:3306/crossword
```

### 4. Generate Schema

```bash
npx ampx generate schema-from-database \
  --connection-uri-secret SQL_CONNECTION_STRING \
  --out amplify/data/schema.sql.ts
```

### 5. Deploy

```bash
npx ampx sandbox
```

## Cost Estimate

- **Free Tier**: 750 hours/month for 12 months (covers 24/7 usage)
- **After Free Tier**: ~$15-20/month
- **Backup Storage**: First 20GB free

## Cleanup (if needed)

To delete the database:

```bash
aws rds delete-db-instance \
  --db-instance-identifier crossword-db \
  --skip-final-snapshot \
  --profile personal \
  --region us-east-1
```

To delete the subnet group and security group:

```bash
aws rds delete-db-subnet-group \
  --db-subnet-group-name crossword-subnet-group \
  --profile personal \
  --region us-east-1

aws ec2 delete-security-group \
  --group-id sg-0ef26905b1935bd1e \
  --profile personal \
  --region us-east-1
```
