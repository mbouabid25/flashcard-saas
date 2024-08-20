/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compiler: {
      styledComponents: true, // Enable native styled-components support
    },
  };
  
  export default nextConfig;