#!/usr/bin/env python3
"""
Generate a secure Django secret key for production deployment
"""
import secrets
import string

def generate_secret_key():
    """Generate a secure secret key for Django"""
    chars = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
    return ''.join(secrets.choice(chars) for _ in range(50))

if __name__ == '__main__':
    secret_key = generate_secret_key()
    print("Generated Django Secret Key:")
    print(secret_key)
    print("\nCopy this key and use it as your SECRET_KEY environment variable in Render.")
    print("Keep this key secure and never commit it to version control!")
