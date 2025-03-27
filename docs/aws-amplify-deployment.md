# AWS Amplify Deployment Guide

This guide provides detailed instructions for deploying the PAKO24 Next.js application to AWS Amplify.

## Prerequisites

Before you begin, ensure you have:

1. An AWS account with appropriate permissions
2. Your code pushed to a Git repository (GitHub, GitLab, BitBucket, etc.)
3. Access to your PostgreSQL database credentials

## Deployment Steps

### 1. Connect Your Repository to AWS Amplify

1. Log in to the [AWS Management Console](https://aws.amazon.com/console/)
2. Navigate to AWS Amplify
3. Click "New app" > "Host web app"
4. Choose your Git provider (GitHub, GitLab, BitBucket, etc.)
5. Authorize AWS Amplify to access your repositories
6. Select the repository containing your PAKO24 application
7. Select the branch you want to deploy (e.g., `main` or `master`)

### 2. Configure Build Settings

Amplify will automatically detect the `amplify.yml` file in your repository, which contains the necessary build settings. The file includes:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npm run prisma:generate
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

This configuration:
- Installs dependencies with `npm ci`
- Generates Prisma client
- Builds the Next.js application
- Specifies the output directory and files to deploy

### 3. Set Environment Variables

In the Amplify Console:

1. Go to your app > "Environment variables"
2. Add the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL database username | `postgredb` |
| `DB_PASSWORD` | PostgreSQL database password | `your-password` |
| `DB_HOST` | PostgreSQL database host | `database-1.c1ao68kgw7rz.eu-west-2.rds.amazonaws.com` |
| `DB_PORT` | PostgreSQL database port | `5432` |
| `DB_NAME` | PostgreSQL database name | `postgres` |
| `NODE_ENV` | Environment | `production` |
| `APP_URL` | Your application URL | `https://main.d1abc123.amplifyapp.com` or your custom domain |

### 4. Deploy Your Application

1. Click "Save and deploy" to start the deployment process
2. Amplify will build and deploy your application according to the settings in `amplify.yml`
3. You can monitor the build progress in the Amplify Console

### 5. Configure Custom Domain (Optional)

1. In the Amplify Console, go to your app > "Domain management"
2. Click "Add domain"
3. Enter your domain name and follow the instructions to verify ownership
4. Configure your DNS settings as instructed by AWS Amplify

### 6. Monitoring and Logs

- Access build logs: Go to your app > "Hosting" > select a build > "Build logs"
- Access application logs: Go to your app > "Hosting" > "Monitoring"

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check the build logs for specific error messages
   - Ensure all dependencies are correctly specified in `package.json`
   - Verify that environment variables are correctly set

2. **Database Connection Issues**:
   - Ensure your RDS security group allows connections from Amplify
   - Verify database credentials are correct
   - Check that the database is accessible from the internet or through a VPC

3. **Next.js Configuration Issues**:
   - Ensure `next.config.mjs` is properly configured for Amplify
   - The `output: 'standalone'` setting is important for proper deployment

## Updating Your Deployment

When you push changes to your connected Git repository, AWS Amplify will automatically rebuild and redeploy your application.

## Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)
- [Prisma with Next.js](https://www.prisma.io/nextjs)
