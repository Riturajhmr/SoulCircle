import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import Card from './ui/card';
import Button from './ui/button';

const FirebaseConnectionTest = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResult('🔄 Testing Firebase connection...');

    try {
      // Test 1: Check if Firebase is initialized
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      setTestResult('✅ Firebase initialized');

      // Test 2: Test Firestore write
      const testRef = doc(db, 'test', 'connection-test');
      await setDoc(testRef, {
        message: 'Connection test successful',
        timestamp: serverTimestamp(),
        testTime: new Date().toISOString()
      });
      setTestResult('✅ Firestore write successful');

      // Test 3: Test Firestore read
      const testSnap = await getDoc(testRef);
      if (testSnap.exists()) {
        setTestResult('✅ Firestore read successful - All tests passed!');
      } else {
        setTestResult('❌ Firestore read failed');
      }

    } catch (error) {
      console.error('Firebase test error:', error);
      
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        setTestResult('❌ BLOCKED BY CLIENT - Check ad blockers or network settings');
      } else if (error.message.includes('Failed to fetch')) {
        setTestResult('❌ NETWORK ERROR - Check internet connection');
      } else if (error.message.includes('permissions')) {
        setTestResult('❌ PERMISSIONS ERROR - Check Firestore rules');
      } else {
        setTestResult(`❌ Firebase error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run test when component mounts
    testFirebaseConnection();
  }, []);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">🔧 Firebase Connection Test</h3>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Purpose:</strong> Test if Firebase is accessible from your browser</p>
          <p><strong>Common Issues:</strong> Ad blockers, network restrictions, firewall</p>
        </div>
        
        <Button
          onClick={testFirebaseConnection}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Firebase Connection'}
        </Button>

        {testResult && (
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-sm font-medium">{testResult}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>If blocked:</strong> Disable ad blockers, try incognito mode</p>
          <p><strong>If network error:</strong> Check internet connection</p>
          <p><strong>If permissions error:</strong> Check Firestore security rules</p>
        </div>
      </div>
    </Card>
  );
};

export default FirebaseConnectionTest;
