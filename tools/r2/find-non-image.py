# python3 -m venv path/to/venv
# source path/to/venv/bin/activate
# pip3 install boto3 python-dotenv
# python3 ./tools/r2/find-non-image.py

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

# List all objects in the bucket
response = s3.list_objects_v2(Bucket=bucket_name)

# Filter non-image files
non_image_files = []
for obj in response.get('Contents', []):
    key = obj['Key']
    headResponse = s3.head_object(Bucket=bucket_name, Key=key)
    if 'ContentType' in headResponse and headResponse['ContentType'].startswith('image/'):
        continue  # Skip if the file is an image
    non_image_files.append(key)  # Add non-image file to the list

print(non_image_files)

