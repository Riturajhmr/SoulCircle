import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import Card from './ui/card';
import Button from './ui/button';

const NetworkDiagnostic = () => {
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test, status, message) => {
    setResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    addResult('🔧 Starting', 'info', 'Running network diagnostics...');

    // Test 1: Basic Firebase initialization
    try {
      if (!db) throw new Error('Firebase not initialized');
      addResult('✅ Firebase Init', 'success', 'Firebase initialized successfully');
    } catch (error) {
      addResult('❌ Firebase Init', 'error', `Failed: ${error.message}`);
      setIsRunning(false);
      return;
    }

    // Test 2: Test Firestore write (this is what's being blocked)
    try {
      addResult('🔄 Firestore Write', 'info', 'Testing Firestore write operation...');
      const testRef = doc(db, 'diagnostics', 'network-test');
      await setDoc(testRef, {
        message: 'Network test successful',
        timestamp: serverTimestamp(),
        testTime: new Date().toISOString()
      });
      addResult('✅ Firestore Write', 'success', 'Write operation successful');
    } catch (error) {
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        addResult('❌ Firestore Write', 'error', 'BLOCKED BY CLIENT - Check ad blockers, extensions, or network settings');
      } else if (error.message.includes('Failed to fetch')) {
        addResult('❌ Firestore Write', 'error', 'NETWORK ERROR - Check internet connection');
      } else if (error.message.includes('permissions')) {
        addResult('❌ Firestore Write', 'error', 'PERMISSIONS ERROR - Check Firestore security rules');
      } else {
        addResult('❌ Firestore Write', 'error', `Firestore error: ${error.message}`);
      }
    }

    // Test 3: Test Firestore read
    try {
      addResult('🔄 Firestore Read', 'info', 'Testing Firestore read operation...');
      const testRef = doc(db, 'diagnostics', 'network-test');
      const testSnap = await getDoc(testRef);
      if (testSnap.exists()) {
        addResult('✅ Firestore Read', 'success', 'Read operation successful');
      } else {
        addResult('❌ Firestore Read', 'error', 'Document not found');
      }
    } catch (error) {
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        addResult('❌ Firestore Read', 'error', 'BLOCKED BY CLIENT - Check ad blockers, extensions, or network settings');
      } else {
        addResult('❌ Firestore Read', 'error', `Read error: ${error.message}`);
      }
    }

    // Test 4: Test Firebase Auth (this usually works)
    try {
      addResult('🔄 Firebase Auth', 'info', 'Testing Firebase Auth...');
      // Just test if auth is available, don't actually create user
      if (auth) {
        addResult('✅ Firebase Auth', 'success', 'Firebase Auth initialized');
      } else {
        addResult('❌ Firebase Auth', 'error', 'Firebase Auth not available');
      }
    } catch (error) {
      addResult('❌ Firebase Auth', 'error', `Auth error: ${error.message}`);
    }

    // Test 5: Network connectivity test
    try {
      addResult('🔄 Network Test', 'info', 'Testing general network connectivity...');
      const response = await fetch('https://www.google.com', { mode: 'no-cors' });
      addResult('✅ Network Test', 'success', 'General network connectivity OK');
    } catch (error) {
      addResult('❌ Network Test', 'error', `Network connectivity issue: ${error.message}`);
    }

    addResult('🏁 Complete', 'info', 'Diagnostics completed');
    setIsRunning(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">🔧 Network Diagnostic Tool</h3>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Purpose:</strong> Identify exactly what's being blocked and why</p>
          <p><strong>Tests:</strong> Firebase init, Firestore write/read, Auth, Network connectivity</p>
        </div>
        
        <div className="flex space-x-4">
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run Diagnostics'}
          </Button>
          
          <Button
            onClick={clearResults}
            disabled={isRunning}
            className="bg-gray-500 text-white hover:bg-gray-600"
          >
            Clear Results
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className={`p-3 rounded text-sm ${
                result.status === 'success' ? 'bg-green-50 text-green-800' :
                result.status === 'error' ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
              }`}>
                <div className="flex justify-between items-start">
                  <span className="font-medium">{result.test}</span>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
                <p className="mt-1">{result.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>If Firestore is blocked:</strong> Check ad blockers, privacy extensions, corporate firewall</p>
          <p><strong>If Auth works but Firestore doesn't:</strong> Network is blocking Firestore specifically</p>
          <p><strong>If everything is blocked:</strong> Check internet connection or firewall settings</p>
        </div>
      </div>
    </Card>
  );
};

export default NetworkDiagnostic;
