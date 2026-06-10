// Add this to server.js to enable a simple monitoring dashboard
// Insert this code after your app initialization and before the PORT definition

// In-memory call history (in production, use a database)
let callHistory = [];
const MAX_HISTORY = 50;

// Dashboard HTML
app.get('/dashboard', (req, res) => {
  const dashboardHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Green Leaf AI Receptionist Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            margin-top: 10px;
        }
        .status.active {
            background: #10b981;
            color: white;
        }
        .status.inactive {
            background: #ef4444;
            color: white;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .stat-card {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-card .number {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
        }
        .stat-card .label {
            color: #666;
            margin-top: 5px;
            font-size: 14px;
        }
        .calls-section {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .calls-section h2 {
            color: #333;
            margin-bottom: 20px;
        }
        .call-item {
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 15px;
            background: #f9fafb;
            border-radius: 4px;
        }
        .call-item .time {
            color: #999;
            font-size: 12px;
        }
        .call-item .name {
            font-weight: 600;
            color: #333;
            margin: 5px 0;
        }
        .call-item .details {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
        .call-item .phone {
            color: #667eea;
            font-weight: 500;
        }
        .empty {
            text-align: center;
            color: #999;
            padding: 40px;
        }
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .refresh-btn:hover {
            background: #5568d3;
        }
        @media (max-width: 768px) {
            .stats {
                grid-template-columns: 1fr;
            }
            .header, .calls-section {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌿 Green Leaf AI Receptionist</h1>
            <p>Real-time monitoring dashboard</p>
            <span class="status active" id="status">● Active and Running</span>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="number" id="total-calls">0</div>
                    <div class="label">Total Calls Today</div>
                </div>
                <div class="stat-card">
                    <div class="number" id="total-leads">0</div>
                    <div class="label">Leads Captured</div>
                </div>
                <div class="stat-card">
                    <div class="number" id="active-calls">0</div>
                    <div class="label">Active Calls</div>
                </div>
            </div>
        </div>

        <div class="calls-section">
            <h2>Recent Calls</h2>
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
            <div id="calls-list">
                <div class="empty">No calls yet. First caller will appear here.</div>
            </div>
        </div>
    </div>

    <script>
        // Auto-refresh every 5 seconds
        setInterval(() => {
            fetch('/api/calls')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('total-calls').textContent = data.totalCalls || 0;
                    document.getElementById('total-leads').textContent = data.totalLeads || 0;
                    document.getElementById('active-calls').textContent = data.activeCalls || 0;
                    
                    const callsList = document.getElementById('calls-list');
                    if (data.recentCalls.length === 0) {
                        callsList.innerHTML = '<div class="empty">No calls yet. First caller will appear here.</div>';
                    } else {
                        callsList.innerHTML = data.recentCalls.map(call => \`
                            <div class="call-item">
                                <div class="time">\${new Date(call.timestamp).toLocaleString()}</div>
                                <div class="name">\${call.name || 'Unknown Caller'}</div>
                                <div class="details">
                                    \${call.phone ? '<div class="phone">📞 ' + call.phone + '</div>' : ''}
                                    \${call.service ? '<div>Service: ' + call.service + '</div>' : ''}
                                    \${call.email ? '<div>📧 ' + call.email + '</div>' : ''}
                                </div>
                            </div>
                        \`).join('');
                    }
                })
                .catch(e => console.log('Dashboard fetch error:', e));
        }, 5000);
    </script>
</body>
</html>
  \`;
  res.send(dashboardHTML);
});

// API endpoint for dashboard data
app.get('/api/calls', (req, res) => {
  res.json({
    totalCalls: callHistory.length,
    totalLeads: callHistory.filter(c => c.name || c.phone || c.email).length,
    activeCalls: 1,
    recentCalls: callHistory.slice(0, 20),
  });
});

// Modify the sendLeadEmail function to also log to call history:
// Add this inside the sendLeadEmail function after checking for errors:

/*
  // Add to call history for dashboard
  callHistory.unshift({
    timestamp: new Date(),
    name: leadData.name || 'Unknown',
    phone: leadData.phone || null,
    email: leadData.email || null,
    service: leadData.service || null,
    preferredDay: leadData.preferredDay || null,
    preferredTime: leadData.preferredTime || null,
  });
  
  // Keep only last 50 calls
  if (callHistory.length > MAX_HISTORY) {
    callHistory = callHistory.slice(0, MAX_HISTORY);
  }
*/
