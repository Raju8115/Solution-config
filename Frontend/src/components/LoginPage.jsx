import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import { Button } from '@carbon/react';
import { Login, ArrowRight } from '@carbon/icons-react';
import BgImage from "../images/login_background_image.png";

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/catalog');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={styles.container}>
      {/* Left Panel - Login Form */}
      <div style={styles.leftPanel}>
        <div style={styles.formContainer}>
          {/* Logo/Brand Section */}
          <div style={styles.logoSection}>
            <h1 style={styles.title}>Solution Offering Portal</h1>
            <div style={styles.divider}></div>
          </div>

          {/* Welcome Message */}
          <div style={styles.welcomeSection}>
            <h2 style={styles.welcomeTitle}>Welcome back</h2>
            <p style={styles.welcomeText}>
              Sign in with your IBM W3 credentials to access the portal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBanner}>
              <span style={styles.errorText}>
                Authentication failed. Please try again.
              </span>
            </div>
          )}

          {/* Login Button */}
          <div style={styles.buttonContainer}>
            <Button
              onClick={login}
              renderIcon={ArrowRight}
              size="lg"
              kind="primary"
              style={styles.loginButton}
            >
              Sign in with IBM W3
            </Button>
          </div>

          {/* Footer Info */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              <Login size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              You will be redirected to IBM's secure login page
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Background Image */}
      <div style={{ 
        ...styles.rightPanel, 
        backgroundImage: `url(${BgImage})` 
      }}>
        <div style={styles.overlay}>
          <div style={styles.heroContent}>
            <h2 style={styles.heroTitle}>
              Empowering Innovation Through Solutions
            </h2>
            <p style={styles.heroText}>
              Access comprehensive solution offerings, resources, and tools to drive your business forward.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Styles
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
  },

  // Left Panel Styles
  leftPanel: {
    flex: '0 0 45%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: '2rem',
    position: 'relative',
    zIndex: 1,
  },

  formContainer: {
    width: '100%',
    maxWidth: '480px',
    padding: '2rem',
  },

  logoSection: {
    marginBottom: '3rem',
  },

  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#161616',
    marginBottom: '1rem',
    letterSpacing: '-0.02em',
  },

  divider: {
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, #0f62fe 0%, #00539a 100%)',
    borderRadius: '2px',
  },

  welcomeSection: {
    marginBottom: '2.5rem',
  },

  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: '300',
    color: '#161616',
    marginBottom: '0.75rem',
    letterSpacing: '-0.01em',
  },

  welcomeText: {
    fontSize: '1rem',
    color: '#525252',
    lineHeight: '1.5',
    fontWeight: '400',
  },

  errorBanner: {
    padding: '1rem 1.25rem',
    marginBottom: '2rem',
    backgroundColor: '#fff1f1',
    borderLeft: '4px solid #da1e28',
    borderRadius: '4px',
  },

  errorText: {
    color: '#da1e28',
    fontSize: '0.875rem',
    fontWeight: '500',
  },

  buttonContainer: {
    marginBottom: '2rem',
  },

  loginButton: {
    width: '100%',
    maxWidth: 'none',
    justifyContent: 'space-between',
    height: '56px',
    fontSize: '1rem',
  },

  footer: {
    paddingTop: '2rem',
    borderTop: '1px solid #e0e0e0',
  },

  footerText: {
    fontSize: '0.875rem',
    color: '#8d8d8d',
    display: 'flex',
    alignItems: 'center',
    margin: 0,
  },

  // Right Panel Styles
  rightPanel: {
    flex: '1',
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(15, 98, 254, 0.85) 0%, rgba(0, 83, 154, 0.9) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
  },

  heroContent: {
    maxWidth: '600px',
    color: '#ffffff',
  },

  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '300',
    marginBottom: '1.5rem',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },

  heroText: {
    fontSize: '1.125rem',
    lineHeight: '1.6',
    opacity: 0.95,
    fontWeight: '400',
  },
};

export default LoginPage;