import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  // root 엘리먼트를 찾을 수 없을 때의 처리
  console.error('root 엘리먼트를 찾을 수 없습니다.');
}
