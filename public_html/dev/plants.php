<?php
// Simple dev page for plant generation
// Access at: https://mygarden.webcrafters.be/dev/plants.php
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plant Generator - Dev Panel</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #F5F0E8;
            padding: 40px 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        h1 {
            color: #2B5C10;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #5E5955;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .panel {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 16px;
        }
        label {
            display: block;
            font-weight: 600;
            margin-bottom: 6px;
            color: #1A1916;
        }
        input, select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #DDD6CC;
            border-radius: 8px;
            font-family: inherit;
            font-size: 14px;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #2B5C10;
            box-shadow: 0 0 0 3px rgba(43, 92, 16, 0.1);
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        button {
            background: #2B5C10;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        button:hover {
            background: #3A7318;
        }
        button:disabled {
            background: #999;
            cursor: not-allowed;
        }
        .results {
            margin-top: 24px;
        }
        .status {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
        }
        .status.loading {
            background: #E3F2FD;
            color: #1565C0;
        }
        .status.success {
            background: #E8F5E9;
            color: #2E7D32;
        }
        .status.error {
            background: #FFEBEE;
            color: #C62828;
        }
        .plant-list {
            display: grid;
            gap: 12px;
        }
        .plant-card {
            border: 1px solid #DDD6CC;
            border-radius: 8px;
            padding: 16px;
            background: #FBF9F4;
        }
        .plant-name {
            font-weight: 600;
            color: #1A1916;
            margin-bottom: 4px;
        }
        .plant-meta {
            font-size: 13px;
            color: #5E5955;
            margin-bottom: 8px;
        }
        .plant-desc {
            font-size: 13px;
            color: #5E5955;
            margin: 8px 0;
        }
        .plant-varieties {
            font-size: 12px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #EAE4DA;
        }
        .badge {
            display: inline-block;
            background: #E8F2DF;
            color: #2B5C10;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-right: 6px;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌱 Plant Generator</h1>
        <p class="subtitle">Generate plant library entries using Ollama + Gemma4</p>

        <div class="panel">
            <div class="form-group">
                <label>Count</label>
                <input type="number" id="count" value="5" min="1" max="50">
            </div>

            <div class="form-group">
                <label>Category</label>
                <select id="category">
                    <option value="vegetable">Vegetable</option>
                    <option value="fruit">Fruit</option>
                    <option value="herb">Herb</option>
                    <option value="flower">Flower</option>
                    <option value="grass">Grass</option>
                    <option value="tree">Tree</option>
                    <option value="shrub">Shrub</option>
                    <option value="groundcover">Groundcover</option>
                </select>
            </div>

            <button onclick="generatePlants()">Generate Plants</button>
        </div>

        <div class="results" id="results" style="display: none;">
            <div class="status" id="status"></div>
            <div class="plant-list" id="plantList"></div>
        </div>
    </div>

    <script>
        async function generatePlants() {
            const count = document.getElementById('count').value;
            const category = document.getElementById('category').value;
            const resultsDiv = document.getElementById('results');
            const statusDiv = document.getElementById('status');

            resultsDiv.style.display = 'block';
            statusDiv.className = 'status loading';
            statusDiv.textContent = 'Generating ' + count + ' plants...';
            document.querySelector('button').disabled = true;

            try {
                const response = await fetch('/api/generate-plants.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ count: parseInt(count), category })
                });

                const data = await response.json();

                if (!response.ok || data.error) {
                    statusDiv.className = 'status error';
                    statusDiv.textContent = 'Error: ' + (data.error || 'Unknown error');
                    return;
                }

                statusDiv.className = 'status success';
                statusDiv.textContent = 'Success! Saved ' + data.saved + ' plants' + (data.failed > 0 ? ', failed: ' + data.failed : '');

                displayPlants(data.plants || []);
            } catch (error) {
                statusDiv.className = 'status error';
                statusDiv.textContent = 'Error: ' + error.message;
            } finally {
                document.querySelector('button').disabled = false;
            }
        }

        function displayPlants(plants) {
            const list = document.getElementById('plantList');
            list.innerHTML = plants.map(p => `
                <div class="plant-card">
                    <div class="plant-name">${p.icon || '🌱'} ${p.name || 'Unknown'}</div>
                    <div class="plant-meta">
                        <span class="badge">${p.sunlight || 'full sun'}</span>
                        <span class="badge">${p.water_needs || 'medium'}</span>
                        <span class="badge">${p.days_to_maturity || '60'} days</span>
                    </div>
                    <div class="plant-desc">${p.description || ''}</div>
                    ${p.varieties && p.varieties.length > 0 ? `
                        <div class="plant-varieties">
                            <strong>Varieties:</strong> ${p.varieties.join(', ')}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        document.getElementById('count').addEventListener('keypress', e => e.key === 'Enter' && generatePlants());
    </script>
</body>
</html>
