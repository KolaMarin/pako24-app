This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on AWS Amplify

This project is configured for deployment on AWS Amplify. Follow these steps to deploy:

1. **Connect your repository to AWS Amplify**:
   - Log in to the AWS Management Console and navigate to AWS Amplify
   - Click "New app" > "Host web app"
   - Connect to your Git provider and select your repository
   - Follow the prompts to connect your repository

2. **Configure build settings**:
   - Amplify will automatically detect the amplify.yml file in your repository
   - This file contains the necessary build settings for your Next.js app

3. **Set environment variables**:
   - In the Amplify Console, go to your app > Environment variables
   - Add the following environment variables:
     - `DB_USER`: Your PostgreSQL database username
     - `DB_PASSWORD`: Your PostgreSQL database password
     - `DB_HOST`: Your PostgreSQL database host
     - `DB_PORT`: Your PostgreSQL database port (usually 5432)
     - `DB_NAME`: Your PostgreSQL database name
     - Any other environment variables your app requires

4. **Deploy**:
   - Click "Save and deploy" to start the deployment process
   - Amplify will build and deploy your application

5. **Access your deployed app**:
   - Once deployment is complete, you can access your app at the provided Amplify URL
   - You can also configure a custom domain in the Amplify Console

## Deploy on Vercel (Alternative)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
