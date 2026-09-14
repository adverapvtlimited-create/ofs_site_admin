'use client';

import React, { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { Monitor, Smartphone, Globe, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      if (res.ok) {
        setDevices(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const revokeDevice = async (id) => {
    if (!confirm('Are you sure you want to revoke access for this device?')) return;
    
    try {
      const res = await fetch('/api/devices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchDevices();
      } else {
        alert('Failed to revoke device');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const getDeviceIcon = (userAgent) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
      return <Smartphone className="h-6 w-6 text-gray-500" />;
    }
    return <Monitor className="h-6 w-6 text-gray-500" />;
  };

  return (
    <AdminShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Active Devices</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage devices authorized to access the OFS Admin Portal.
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-sm font-medium">Pseudo-IP Whitelist Active</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading devices...</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {devices.map((device) => (
                <li key={device.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getDeviceIcon(device.user_agent)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{device.device_name}</h3>
                          {device.isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3" /> Current Device
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                          <Globe className="h-4 w-4" /> 
                          {device.user_agent.substring(0, 50)}...
                        </p>
                        <p className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Last active: {new Date(device.last_used_at || device.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      {!device.isCurrent ? (
                        <button
                          onClick={() => revokeDevice(device.id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400 font-medium px-4">Active</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              
              {devices.length === 0 && (
                <div className="p-12 text-center text-gray-500">No active devices found.</div>
              )}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
