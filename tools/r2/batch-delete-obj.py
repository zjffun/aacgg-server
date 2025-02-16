# delete keys
keys = ['0_yCVZ_Tl1W1HE5lNVMDl', '7LaLG9l-qWYyB-uaZ7c2_', 'R8fz_qdV6sxqouooUGmit', 'SVpp6zPM2BwgTXfxGvJak', 'XahytjGpLDDZfu8Y1oUaO', '_BoVf2M38osQCwNNJtlGW', 'eMpgz6IR7aKZOw7HPluj5', 'jDfLrfy_7deXimSlSWl7r', 'oVot2Y-WK3JIOrp15PxOF', 'qFQRA4LwfK7vBgrfigwjP', 'qK-jHxeFqdibhGCH5H1Xf', 'spXYFHxKCoVGATqcxKp3A', 'wNRRwA1Ee4tpmnOlpdD7U']

# python3 -m venv path/to/venv
# source path/to/venv/bin/activate
# pip3 install boto3 python-dotenv
# python3 ./tools/r2/batch-delete-obj.py

import boto3
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

# Access the variables
R2_ACCOUNT_ID = os.getenv('R2_ACCOUNT_ID')
R2_ACCESS_KEY_ID = os.getenv('R2_ACCESS_KEY_ID')
R2_SECRET_ACCESS_KEY = os.getenv('R2_SECRET_ACCESS_KEY')
R2_BUCKET_NAME = os.getenv('R2_BUCKET_NAME')

# Initialize the S3 client for R2
s3 = boto3.client(
    's3',
    endpoint_url='https://' + R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY
)

bucket_name = R2_BUCKET_NAME

for key in keys:
    try:
        s3.delete_object(Bucket=bucket_name, Key=key)
        print(f'Successfully deleted: {key}')
    except Exception as e:
        print(f'Error deleting {key}: {e}')
