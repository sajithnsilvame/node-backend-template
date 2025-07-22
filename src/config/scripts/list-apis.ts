#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface ApiEndpoint {
    method: string;
    path: string;
    description: string;
    tags: string[];
    authentication: boolean;
    roles?: string[];
}

class APILister {
    private endpoints: ApiEndpoint[] = [];
    private routesDir = path.join(__dirname, '../../routes');

    // ANSI color codes
    private colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        dim: '\x1b[2m',
        
        // Method colors
        GET: '\x1b[32m',      // Green
        POST: '\x1b[34m',     // Blue  
        PUT: '\x1b[33m',      // Yellow
        PATCH: '\x1b[35m',    // Magenta
        DELETE: '\x1b[31m',   // Red
        
        // Other colors
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        gray: '\x1b[90m'
    };

    private colorizeMethod(method: string): string {
        const color = this.colors[method as keyof typeof this.colors] || this.colors.white;
        return `${color}${this.colors.bright}${method}${this.colors.reset}`;
    }

    constructor() {
        this.scanRoutes();
    }

    private scanRoutes(): void {
        // Automatically discover all route files
        const routeFiles = fs.readdirSync(this.routesDir)
            .filter(file => file.endsWith('.routes.ts'));

        routeFiles.forEach(file => {
            const filePath = path.join(this.routesDir, file);
            if (fs.existsSync(filePath)) {
                this.parseRouteFile(filePath, file);
            }
        });
    }

    private parseRouteFile(filePath: string, fileName: string): void {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        let currentSwagger: any = {};
        let isInSwaggerBlock = false;
        const swaggerEndpoints = new Set<string>(); // Track documented endpoints
        
        // First pass: Parse Swagger documented endpoints
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check for Swagger documentation start
            if (line.includes('@swagger')) {
                isInSwaggerBlock = true;
                currentSwagger = {};
                continue;
            }
            
            // Parse Swagger content
            if (isInSwaggerBlock) {
                if (line.includes('*   ') || line.includes('*     ')) {
                    const swaggerLine = line.replace(/^\*\s*/, '');
                    
                    // Parse path
                    if (swaggerLine.startsWith('/')) {
                        const pathMatch = swaggerLine.match(/^(\/[\w\-\/{}:]+):\s*$/);
                        if (pathMatch) {
                            currentSwagger.path = pathMatch[1];
                        }
                    }
                    
                    // Parse method
                    if (['get:', 'post:', 'put:', 'delete:', 'patch:'].some(method => swaggerLine.includes(method))) {
                        const methodMatch = swaggerLine.match(/^\s*(get|post|put|delete|patch):\s*$/);
                        if (methodMatch) {
                            currentSwagger.method = methodMatch[1].toUpperCase();
                        }
                    }
                    
                    // Parse tags
                    if (swaggerLine.includes('tags:') && lines[i + 1]) {
                        const tagMatch = lines[i + 1].match(/\[(.*?)\]/);
                        if (tagMatch) {
                            currentSwagger.tags = [tagMatch[1]];
                        }
                    }
                    
                    // Parse summary
                    if (swaggerLine.includes('summary:')) {
                        const summaryMatch = swaggerLine.match(/summary:\s*(.+)/);
                        if (summaryMatch) {
                            currentSwagger.summary = summaryMatch[1];
                        }
                    }
                    
                    // Parse description
                    if (swaggerLine.includes('description:')) {
                        const descMatch = swaggerLine.match(/description:\s*(.+)/);
                        if (descMatch) {
                            currentSwagger.description = descMatch[1];
                        }
                    }
                    
                    // Check for authentication
                    if (swaggerLine.includes('bearerAuth')) {
                        currentSwagger.authentication = true;
                    }
                }
                
                // End of swagger block
                if (line.includes('*/')) {
                    isInSwaggerBlock = false;
                    
                    // Look for the actual route definition in the next few lines
                    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                        const routeLine = lines[j].trim();
                        // Skip commented lines
                        if (routeLine.startsWith('//') || routeLine.startsWith('*') || routeLine.startsWith('/*')) {
                            continue;
                        }
                        if (routeLine.startsWith('router.')) {
                            const routeMatch = routeLine.match(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/);
                            if (routeMatch) {
                                const method = routeMatch[1].toUpperCase();
                                const routePath = routeMatch[2];
                                
                                // Collect the full route definition (may span multiple lines)
                                let fullRouteDefinition = routeLine;
                                let k = j + 1;
                                
                                // Only continue if the current line doesn't end with semicolon
                                if (!routeLine.endsWith(';')) {
                                    while (k < lines.length) {
                                        const nextLine = lines[k].trim();
                                        // Skip empty lines and comments
                                        if (nextLine === '' || nextLine.startsWith('//') || nextLine.startsWith('*') || nextLine.startsWith('/*')) {
                                            k++;
                                            continue;
                                        }
                                        
                                        // If we hit another router definition, stop
                                        if (nextLine.startsWith('router.')) {
                                            break;
                                        }
                                        
                                        fullRouteDefinition += ' ' + nextLine;
                                        
                                        // If this line ends with semicolon, we're done
                                        if (nextLine.endsWith(';')) {
                                            break;
                                        }
                                        k++;
                                    }
                                }
                                
                                // Check for authentication middleware
                                const hasAuth = fullRouteDefinition.includes('Authenticated');
                                
                                // Check for role-based access - only in non-commented lines
                                const roleMatch = fullRouteDefinition.match(/canAccess\(\[(.*?)\]/);
                                let roles: string[] = [];
                                if (roleMatch) {
                                    roles = roleMatch[1].split(',').map(r => r.trim().replace(/['"]/g, ''));
                                }
                                
                                // Build the full path dynamically
                                let basePath = '';
                                if (fileName.includes('auth')) basePath = '/api/v1/auth';
                                else if (fileName.includes('user.routes')) basePath = '/api/v1/user';
                                else if (fileName.includes('keyword')) basePath = '/api/v1/keyword';
                                else if (fileName.includes('roles')) basePath = '/api/v1/user-role';
                                else if (fileName.includes('appointment')) basePath = '/api/v1/appointment';
                                else {
                                    // Dynamic base path for new route files
                                    const routeName = fileName.replace('.routes.ts', '');
                                    basePath = `/api/v1/${routeName}`;
                                }
                                
                                const fullPath = basePath + routePath;
                                const endpointKey = `${method}:${fullPath}`;
                                swaggerEndpoints.add(endpointKey);
                                
                                this.endpoints.push({
                                    method: method,
                                    path: fullPath,
                                    description: currentSwagger.summary || currentSwagger.description || 'No description',
                                    tags: currentSwagger.tags || [],
                                    authentication: hasAuth || currentSwagger.authentication || false,
                                    roles: roles.length > 0 ? roles : undefined
                                });
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        // Second pass: Find undocumented routes (like file uploads)
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip commented lines for undocumented route detection too
            if (line.startsWith('//') || line.startsWith('*') || line.startsWith('/*')) {
                continue;
            }
            
            // Look for router definitions that weren't captured by Swagger
            if (line.startsWith('router.')) {
                const routeMatch = line.match(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/);
                if (routeMatch) {
                    const method = routeMatch[1].toUpperCase();
                    const routePath = routeMatch[2];
                    
                    // Build the full path
                    let basePath = '';
                    if (fileName.includes('auth')) basePath = '/api/v1/auth';
                    else if (fileName.includes('user.routes')) basePath = '/api/v1/user';
                    else if (fileName.includes('keyword')) basePath = '/api/v1/keyword';
                    else if (fileName.includes('roles')) basePath = '/api/v1/user-role';
                    else if (fileName.includes('appointment')) basePath = '/api/v1/appointment';
                    else if (fileName.includes('doctor')) basePath = '/api/v1/doctor';
                    else {
                        // Dynamic base path for new route files
                        const routeName = fileName.replace('.routes.ts', '');
                        basePath = `/api/v1/${routeName}`;
                    }
                    
                    const fullPath = basePath + routePath;
                    const endpointKey = `${method}:${fullPath}`;
                    
                    // Only add if not already documented by Swagger
                    if (!swaggerEndpoints.has(endpointKey)) {
                        // Collect the full route definition (may span multiple lines)
                        let fullRouteDefinition = line;
                        let k = i + 1;
                        
                        // Only continue if the current line doesn't end with semicolon
                        if (!line.endsWith(';')) {
                            while (k < lines.length) {
                                const nextLine = lines[k].trim();
                                // Skip empty lines and comments
                                if (nextLine === '' || nextLine.startsWith('//') || nextLine.startsWith('*') || nextLine.startsWith('/*')) {
                                    k++;
                                    continue;
                                }
                                
                                // If we hit another router definition, stop
                                if (nextLine.startsWith('router.')) {
                                    break;
                                }
                                
                                fullRouteDefinition += ' ' + nextLine;
                                
                                // If this line ends with semicolon, we're done
                                if (nextLine.endsWith(';')) {
                                    break;
                                }
                                k++;
                            }
                        }
                        
                        // Check for authentication middleware
                        const hasAuth = fullRouteDefinition.includes('Authenticated');
                        
                        // Check for role-based access - only in non-commented lines
                        const roleMatch = fullRouteDefinition.match(/canAccess\(\[(.*?)\]/);
                        let roles: string[] = [];
                        if (roleMatch) {
                            roles = roleMatch[1].split(',').map(r => r.trim().replace(/['"]/g, ''));
                        }
                        
                        // Try to infer if it's a file upload endpoint
                        let description = 'Undocumented endpoint';
                        let tags = ['Undocumented'];
                        
                        // Check for common file upload patterns
                        if (fullRouteDefinition.includes('upload') || fullRouteDefinition.includes('multer') || 
                            routePath.includes('upload') || routePath.includes('file') ||
                            routePath.includes('image') || routePath.includes('video') ||
                            routePath.includes('document') || routePath.includes('media')) {
                            description = 'File upload endpoint (inferred)';
                            tags = ['File Upload'];
                        }
                        
                        // Check for common patterns to infer description
                        if (routePath.includes('download')) {
                            description = 'File download endpoint (inferred)';
                            tags = ['File Download'];
                        }
                        
                        // Infer tag from filename if no specific pattern found
                        if (description === 'Undocumented endpoint') {
                            const fileTag = fileName.replace('.routes.ts', '').charAt(0).toUpperCase() + 
                                          fileName.replace('.routes.ts', '').slice(1);
                            tags = [fileTag];
                        }
                        
                        this.endpoints.push({
                            method: method,
                            path: fullPath,
                            description: description,
                            tags: tags,
                            authentication: hasAuth,
                            roles: roles.length > 0 ? roles : undefined
                        });
                    }
                }
            }
        }
    }

    public listAPIs(format: 'table' | 'json' | 'detailed' = 'table'): void {
        console.log('\n🚀 API Endpoints Summary\n');
        console.log(`Total Endpoints: ${this.endpoints.length}\n`);
        
        if (format === 'json') {
            console.log(JSON.stringify(this.endpoints, null, 2));
            return;
        }
        
        // Group by tags
        const groupedEndpoints = this.endpoints.reduce((acc, endpoint) => {
            const tag = endpoint.tags[0] || 'Uncategorized';
            if (!acc[tag]) acc[tag] = [];
            acc[tag].push(endpoint);
            return acc;
        }, {} as Record<string, ApiEndpoint[]>);
        
        if (format === 'detailed') {
            Object.entries(groupedEndpoints).forEach(([tag, endpoints]) => {
                console.log(`\n📁 ${tag}`);
                console.log('='.repeat(50));
                endpoints.forEach(endpoint => {
                    const colorizedMethod = this.colorizeMethod(endpoint.method);
                    console.log(`\n${colorizedMethod} ${endpoint.path}`);
                    console.log(`   Description: ${endpoint.description}`);
                    console.log(`   Authentication: ${endpoint.authentication ? '🔒 Required' : '🔓 Not Required'}`);
                    if (endpoint.roles) {
                        console.log(`   Required Roles: ${endpoint.roles.join(', ')}`);
                    }
                });
            });
        } else {
            // Table format
            Object.entries(groupedEndpoints).forEach(([tag, endpoints]) => {
                console.log(`\n📁 ${this.colors.cyan}${this.colors.bright}${tag}${this.colors.reset}`);
                console.log('─'.repeat(140));
                console.log(
                    'Method'.padEnd(10) + 
                    'Endpoint'.padEnd(45) + 
                    'Auth'.padEnd(10) + 
                    'Roles'.padEnd(25) + 
                    'Description'
                );
                console.log('─'.repeat(140));
                
                endpoints.forEach(endpoint => {
                    const colorizedMethod = this.colorizeMethod(endpoint.method);
                    const methodPadding = ' '.repeat(Math.max(0, 10 - endpoint.method.length));
                    const path = endpoint.path.length > 43 ? endpoint.path.substring(0, 40) + '...' : endpoint.path.padEnd(45);
                    const auth = (endpoint.authentication ? '🔒 Yes' : '🔓 No').padEnd(10);
                    const roles = (endpoint.roles?.join(',') || 'None').substring(0, 23).padEnd(25);
                    
                    // Add indicator for documented vs undocumented
                    let descPrefix = '';
                    if (endpoint.tags.includes('Undocumented')) {
                        descPrefix = '📄 ';
                    } else if (endpoint.tags.includes('File Upload') || endpoint.tags.includes('File Download')) {
                        descPrefix = '🗂️ ';
                    } else {
                        descPrefix = '📝 ';
                    }
                    
                    const desc = (descPrefix + endpoint.description).length > 45 ? 
                                (descPrefix + endpoint.description).substring(0, 42) + '...' : 
                                (descPrefix + endpoint.description);
                    
                    console.log(`${colorizedMethod}${methodPadding}${path}${auth}${roles}${desc}`);
                });
                console.log(''); // Add spacing between sections
            });
        }
        
        console.log('\n');
        console.log('Legend:');
        console.log('🔒 = Authentication Required, 🔓 = No Authentication');
        console.log('📝 = Documented in Swagger, 📄 = Undocumented (auto-detected)');
        console.log('🗂️ = File Upload/Download endpoints');
        console.log('\nHTTP Method Colors:');
        console.log(`${this.colorizeMethod('GET')} = Retrieve data`);
        console.log(`${this.colorizeMethod('POST')} = Create new resource`);
        console.log(`${this.colorizeMethod('PUT')} = Update entire resource`);
        console.log(`${this.colorizeMethod('PATCH')} = Partial update`);
        console.log(`${this.colorizeMethod('DELETE')} = Remove resource`);
        console.log('\n');
    }
}

// CLI handling
const args = process.argv.slice(2);
const format = args[0] as 'table' | 'json' | 'detailed' || 'table';

const lister = new APILister();
lister.listAPIs(format);
