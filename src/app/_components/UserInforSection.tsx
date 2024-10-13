import { Card, Button, User } from "@nextui-org/react";
import { PlayCircleIcon } from "@heroicons/react/24/solid"; 
import { SignOut } from '@/actions/auth';

const LogoutButton = ({ onSignout }) => {
  return (
    <Button 
      color="error" 
      onClick={onSignout} 
      className="mt-4 w-full" 
    >
      Logout
    </Button>
  );
};

const UserInforSection = ({ user }) => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Your Account</h3>
        <User 
          name={user.email}
          description="Account Email"
          avatarProps={{
            src: user.image
          }}
        />
        <LogoutButton onSignout={() => SignOut()} />
      </Card>
    </div>
  );
};

export default UserInforSection;