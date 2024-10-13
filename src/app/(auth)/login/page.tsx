"use client"
import { useState, useEffect } from 'react';
import { Button, Card, CardBody, Switch } from '@nextui-org/react';
import { FaGoogleDrive } from "react-icons/fa";
import { useTheme } from 'next-themes';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import Spinner from '@/components/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { SignIn } from '@/actions/auth';
import { useSearchParams, useRouter } from "next/navigation";

const LoginPage = () => {
  const searchParams = useSearchParams()
  const [showInfo, setShowInfo] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md p-8 text-center shadow-xl">
          <CardBody>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <FaGoogleDrive size={80} className="mx-auto text-blue-500 dark:text-blue-400" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Connect Your Google Drive</h2>
            <p className="mb-8 text-gray-600 dark:text-gray-400">
              Sign in with Google to connect your <span className="text-blue-500 dark:text-blue-400 font-semibold">Google Drive</span> account.
            </p>
            <Button
              onPress={() => SignIn()}
              color="primary"
              size="lg"
              className="w-full font-semibold text-lg py-6"
              auto
            >
            Sign in with Google
            </Button>
            
            <div className="mt-8">
              <Button
                light
                auto
                icon={showInfo ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                onPress={() => setShowInfo(!showInfo)}
                className="text-gray-600 dark:text-gray-400"
              >
                {showInfo ? 'Hide' : 'Show'} Important Information
              </Button>
            </div>
            
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <Info className="text-blue-500 dark:text-blue-400 mx-auto mb-2" size={24} />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Please ensure you carefully read the tutorial and check the option "See, edit, create, and delete only the specific Google Drive files you use with this app."
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
