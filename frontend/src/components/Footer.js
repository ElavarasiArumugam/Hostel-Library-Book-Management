import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <h2 style={styles.heading}>Engineering College Hostels</h2>
      
      {/* Address extracted from your image */}
      <p style={styles.text}>12, Sardar Patel Road, Anna University, Guindy</p>
      <p style={styles.text}>Chennai - 600025</p>
      
      {/* Contact Info */}
      <div style={styles.contactRow}>
        <span>📞 044-22352257</span>
        <span style={{ marginLeft: '20px' }}>✉️ echquery@yahoo.com</span>
      </div>
      
      {/* Footer Links */}
      <div style={styles.links}>
        <span>Privacy policy</span> / <span>Terms & conditions</span>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#6E4B39', // ECH Brown Theme
    color: 'white',
    textAlign: 'center',
    padding: '30px 20px',
    marginTop: 'auto',
  },
  heading: {
    fontSize: '22px',
    marginBottom: '10px',
  },
  text: {
    margin: '5px 0',
    fontSize: '16px',
  },
  contactRow: {
    margin: '15px 0',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  links: {
    color: '#F4911E', // Orange color from the image text
    marginTop: '15px',
    cursor: 'pointer',
  }
};

export default Footer;