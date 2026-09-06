#!/bin/bash
# Opens a local tunnel to the private crossword RDS instance.
#
# The DB has no public IP (publiclyAccessible: false, saves the IPv4 charge)
# and its security group only admits the sql-queries Lambda and the admin
# tunnel endpoint. This script tunnels 127.0.0.1:3306 -> DB via the free
# EC2 Instance Connect Endpoint deployed in amplify/backend.ts.
#
# Usage:
#   ./scripts/db-tunnel.sh          # keeps running; Ctrl-C to close
# then in another terminal, run admin scripts with the host swapped:
#   SQL_CONNECTION_STRING="mysql://admin:<password>@127.0.0.1:3306/crossword" \
#     npx tsx scripts/delete-user-account.ts <email>
set -euo pipefail

PROFILE="${AWS_PROFILE:-personal}"
REGION=us-west-2
LOCAL_PORT="${LOCAL_PORT:-3306}"

DB_HOST=$(aws rds describe-db-instances --profile "$PROFILE" --region "$REGION" \
  --query "DBInstances[?DBName=='crossword'] | [0].Endpoint.Address" --output text)
DB_IP=$(dig +short "$DB_HOST" | tail -1)
EICE_ID=$(aws ec2 describe-instance-connect-endpoints --profile "$PROFILE" --region "$REGION" \
  --filters Name=state,Values=create-complete \
  --query 'InstanceConnectEndpoints[0].InstanceConnectEndpointId' --output text)

if [ -z "$DB_IP" ] || [ "$EICE_ID" = "None" ]; then
  echo "Could not resolve DB private IP ($DB_HOST -> $DB_IP) or find the" >&2
  echo "Instance Connect Endpoint ($EICE_ID). Has amplify/backend.ts deployed?" >&2
  exit 1
fi

echo "Tunneling 127.0.0.1:$LOCAL_PORT -> $DB_HOST ($DB_IP:3306) via $EICE_ID"
exec aws ec2-instance-connect open-tunnel \
  --profile "$PROFILE" --region "$REGION" \
  --instance-connect-endpoint-id "$EICE_ID" \
  --private-ip-address "$DB_IP" \
  --remote-port 3306 \
  --local-port "$LOCAL_PORT"
