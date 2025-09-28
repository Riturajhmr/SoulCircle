import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from './ui/card';
import Button from './ui/button';

const LoginTest = () => {
  const { login, signup } = useAuth();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('test123456');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testSignup = async () => {
    setIsLoading(true);
    setResult('Creating test account...');
    
    try {
      await signup(testEmail, testPassword, 'Test User');
      setResult('✅ Test account created successfully!');
    } catch (error) {
      setResult(`❌ Signup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setResult('Testing login...');
    
    try {
      await login(testEmail, testPassword);
      setResult('✅ Login successful!');
    } catch (error) {
      setResult(`❌ Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">🧪 Login Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Email:</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="test@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Test Password:</label>
          <input
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="test123456"
          />
        </div>
        
        <div className="flex space-x-4">
          <Button
            onClick={testSignup}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600"
          >
            Test Signup
          </Button>
          
          <Button
            onClick={testLogin}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Test Login
          </Button>
        </div>
        
        {result && (
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-sm">{result}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LoginTest;
