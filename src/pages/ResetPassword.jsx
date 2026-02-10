import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosBase from '../AxiosConfig';
import styles from '../styles/ResetPassword.module.css';

export default function ResetPassword(){
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e){
    e.preventDefault();
    if(password !== confirm){ setStatus({ ok:false, message:'Passwords do not match' }); return; }
    setLoading(true); setStatus(null);
    try{
      const { data } = await axiosBase.post('/users/reset-password', { token, password });
      setStatus({ ok:true, message: data.message || 'Password updated' });
      setTimeout(()=> navigate('/login'), 1200);
    }catch(err){
      setStatus({ ok:false, message: err?.response?.data?.message || 'Request failed' });
    }finally{ setLoading(false); }
  }
  // If token is missing, show helpful instructions
  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Reset link required</h2>
          <p className={styles.intro}>It looks like you opened this page without a reset link.</p>
          <p className={styles.intro}>Please check the reset email and click the link inside it, or request a new link below.</p>
          <div style={{marginTop:12}}>
            <a href="/forgot-password" className={styles.forgotLink}>Request a new reset link</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Reset password</h2>
        <p className={styles.intro}>Choose a new password for your account.</p>

        <label className={styles.label}>New password</label>
        <input className={styles.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} required />

        <label className={styles.label}>Confirm password</label>
        <input className={styles.input} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />

        <button className={styles.submit} disabled={loading}>{loading ? 'Saving...' : 'Save new password'}</button>

        {status && <div className={status.ok ? styles.success : styles.error}>{status.message}</div>}
      </form>
    </div>
  )
}
