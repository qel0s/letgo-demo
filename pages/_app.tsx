import '@/styles/globals.scss';
import '@/styles/styles.scss';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { message } from 'antd';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const [messageApi, messageContext] = message.useMessage();

  return (
    <QueryClientProvider client={queryClient}>
      {messageContext}
      <Component {...pageProps} />;
    </QueryClientProvider>
  );
}
