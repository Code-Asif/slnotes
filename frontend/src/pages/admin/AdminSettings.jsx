import {
  Container,
  Typography,
  Box,
  Alert,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';

const AdminSettings = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Admin Settings
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InfoIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Account Management
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" paragraph>
              <strong>Important:</strong> For security and control purposes, password and email changes are managed directly by the system administrator.
            </Typography>
            <Typography variant="body2">
              If you need to change your password or email, please contact the system administrator who will update it directly in the database.
            </Typography>
          </Alert>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" color="text.secondary" paragraph>
              <strong>How it works:</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <Typography component="li" variant="body2" color="text.secondary" paragraph>
                Contact the system administrator to request a password or email change
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" paragraph>
                The administrator will update your credentials directly in MongoDB Atlas
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Your credentials are stored in plain text for easy database management
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LockIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Password Change
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            Password changes are not available through this interface. Please contact the system administrator.
          </Alert>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Database Location:</strong> MongoDB Atlas - Admin Collection
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Field to Update:</strong> <code>password</code> (stored as plain text)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> The administrator has direct access to modify your password in the database without encryption.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Email Change
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            Email changes are not available through this interface. Please contact the system administrator.
          </Alert>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Database Location:</strong> MongoDB Atlas - Admin Collection
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Fields to Update:</strong> <code>email</code> and <code>username</code> (if needed)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> Both email and username are stored in plain text for easy database management.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminSettings;

