import { useState } from 'react';
import axiosBase from '../AxiosConfig';
import styles from '../styles/ForgotPassword.module.css';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword(){
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try{
      const { data } = await axiosBase.post('/users/forgot-password', { email });

      const message = data.message || 'If that email exists, a reset link has been sent';
      const statusObj = { ok: true, message };

      if (data.resetUrl) {
        statusObj.resetUrl = data.resetUrl;
        // try to navigate if same origin
        try {
          const url = new URL(data.resetUrl);
          if (url.origin === window.location.origin) {
            navigate(url.pathname + url.search + url.hash);
          } else {
            // open in new tab for cross-origin
            window.open(data.resetUrl, '_blank');
          }
        } catch (e) {
          // ignore URL parsing errors
        }
      }

      setStatus(statusObj);
    }catch(err){
      console.error('forgot-password error', err);
      setStatus({ ok: false, message: err?.response?.data?.message || 'Request failed' });
    }finally{ setLoading(false); }
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Forgot password</h2>
        <p className={styles.intro}>Enter the email for your account and we'll send a reset link.</p>

        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
        />

        <button className={styles.submit} disabled={loading}>{loading? 'Sending...' : 'Send reset link'}</button>

        {status && (
          <div className={status.ok ? styles.success : styles.error}>
            {status.message}
            {status.resetUrl && (
              <div style={{marginTop:8}}>
                <a href={status.resetUrl} target="_blank" rel="noreferrer" className={styles.link}>Open reset link (dev)</a>
                <div style={{fontSize:12, color:'var(--muted)', marginTop:6, wordBreak:'break-all'}}>{status.resetUrl}</div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
