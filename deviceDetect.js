// Device Detection System
class DeviceDetector {
    constructor() {
        this.deviceInfo = this.detectDevice();
        this.displayInfo = this.getDisplayInfo();
        this.performance = this.getPerformanceInfo();
        this.storage = this.getStorageInfo();
        this.connection = this.getConnectionInfo();
    }

    detectDevice() {
        const ua = navigator.userAgent;
        let device = {
            type: 'desktop',
            os: 'Unknown',
            browser: 'Unknown',
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            vendor: navigator.vendor || 'Unknown'
        };

        // Detect OS
        if (/Windows/.test(ua)) device.os = 'Windows';
        else if (/Mac/.test(ua)) device.os = 'macOS';
        else if (/Linux/.test(ua)) device.os = 'Linux';
        else if (/Android/.test(ua)) device.os = 'Android';
        else if (/iPhone|iPad|iPod/.test(ua)) device.os = 'iOS';

        // Detect Browser
        if (/Firefox/.test(ua)) device.browser = 'Firefox';
        else if (/Chrome/.test(ua)) device.browser = 'Chrome';
        else if (/Safari/.test(ua)) device.browser = 'Safari';
        else if (/Edge/.test(ua)) device.browser = 'Edge';
        else if (/Opera/.test(ua)) device.browser = 'Opera';

        // Detect Device Type
        const isMobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        const isTabletRegex = /iPad|Android|tablet/i;

        if (isMobileRegex.test(ua)) {
            device.isMobile = true;
            device.isDesktop = false;
            device.type = 'mobile';
        }

        if (isTabletRegex.test(ua)) {
            device.isTablet = true;
            device.type = 'tablet';
        }

        if (!device.isMobile && !device.isTablet) {
            device.isDesktop = true;
            device.type = 'desktop';
        }

        return device;
    }

    getDisplayInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            resolution: `${window.innerWidth}x${window.innerHeight}`,
            pixelRatio: window.devicePixelRatio || 1,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        };
    }

    getPerformanceInfo() {
        const perf = window.performance;
        return {
            memory: perf.memory ? {
                usedJSHeapSize: (perf.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                totalJSHeapSize: (perf.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
                jsHeapSizeLimit: (perf.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
            } : 'Not available',
            cores: navigator.hardwareConcurrency || 'Unknown',
            pageLoadTime: perf.timing ? perf.timing.loadEventEnd - perf.timing.navigationStart : 'N/A'
        };
    }

    getStorageInfo() {
        return {
            localStorage: typeof Storage !== 'undefined' ? 'Available' : 'Not available',
            sessionStorage: typeof sessionStorage !== 'undefined' ? 'Available' : 'Not available',
            indexedDB: typeof indexedDB !== 'undefined' ? 'Available' : 'Not available',
            quota: navigator.storage ? 'Available' : 'Not available'
        };
    }

    getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!connection) {
            return { type: 'Unknown', effectiveType: 'Unknown', speed: 'Unknown' };
        }

        return {
            type: connection.type || 'Unknown',
            effectiveType: connection.effectiveType || 'Unknown',
            downlink: connection.downlink ? connection.downlink + ' Mbps' : 'Unknown',
            rtt: connection.rtt ? connection.rtt + ' ms' : 'Unknown',
            saveData: connection.saveData ? 'Yes' : 'No'
        };
    }

    getFullInfo() {
        return {
            device: this.deviceInfo,
            display: this.displayInfo,
            performance: this.performance,
            storage: this.storage,
            connection: this.connection,
            timestamp: new Date().toISOString()
        };
    }

    getBannerText() {
        const { type, os, browser } = this.deviceInfo;
        const { resolution, orientation } = this.displayInfo;
        const typeEmoji = {
            'mobile': '📱',
            'tablet': '📱',
            'desktop': '🖥️'
        };
        return `${typeEmoji[type]} ${type.toUpperCase()} | ${os} | ${browser} | ${resolution} (${orientation})`;
    }

    getStatsText() {
        const { type, os, browser } = this.deviceInfo;
        const { resolution, pixelRatio, orientation } = this.displayInfo;
        const { cores } = this.performance;
        const { effectiveType } = this.connection;

        return `Device: ${type.toUpperCase()} | OS: ${os} | Browser: ${browser}<br>` +
               `Resolution: ${resolution} | Orientation: ${orientation}<br>` +
               `Pixel Ratio: ${pixelRatio}x | CPU Cores: ${cores} | Connection: ${effectiveType}`;
    }
}

// Global device detector instance
const deviceDetector = new DeviceDetector();

// Initialize device detection on page load
window.addEventListener('load', function() {
    showDeviceBanner();
    displayDeviceStats();
    optimizeUIForDevice();
});

// Listen for orientation change
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        deviceDetector.displayInfo = deviceDetector.getDisplayInfo();
        displayDeviceStats();
        optimizeUIForDevice();
    }, 100);
});

// Listen for resize
window.addEventListener('resize', function() {
    deviceDetector.displayInfo = deviceDetector.getDisplayInfo();
    optimizeUIForDevice();
});

function showDeviceBanner() {
    const banner = document.getElementById('deviceBanner');
    const info = document.getElementById('deviceInfo');
    
    if (banner && info) {
        info.textContent = deviceDetector.getBannerText();
        banner.style.display = 'flex';
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (banner.style.display !== 'none') {
                banner.style.opacity = '0.5';
            }
        }, 8000);
    }
}

function closeBanner() {
    const banner = document.getElementById('deviceBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}

function displayDeviceStats() {
    const statsText = document.getElementById('statsText');
    if (statsText) {
        statsText.innerHTML = deviceDetector.getStatsText();
    }
}

function optimizeUIForDevice() {
    const device = deviceDetector.deviceInfo;
    const display = deviceDetector.displayInfo;

    // Optimize for mobile
    if (device.isMobile) {
        document.body.classList.add('mobile-device');
        document.body.classList.remove('tablet-device', 'desktop-device');
    }
    // Optimize for tablet
    else if (device.isTablet) {
        document.body.classList.add('tablet-device');
        document.body.classList.remove('mobile-device', 'desktop-device');
    }
    // Optimize for desktop
    else {
        document.body.classList.add('desktop-device');
        document.body.classList.remove('mobile-device', 'tablet-device');
    }

    // Optimize button sizes based on device
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        if (device.isMobile) {
            btn.style.padding = '12px 30px';
            btn.style.fontSize = '14px';
        } else if (device.isTablet) {
            btn.style.padding = '14px 35px';
            btn.style.fontSize = '16px';
        }
    });

    // Adjust font sizes for small screens
    if (display.width < 480) {
        const title = document.querySelector('.minecraft-title h1');
        if (title) title.style.fontSize = '40px';
    } else if (display.width < 768) {
        const title = document.querySelector('.minecraft-title h1');
        if (title) title.style.fontSize = '48px';
    }
}

// Console commands for device info
window.getDeviceInfo = function() {
    const fullInfo = deviceDetector.getFullInfo();
    console.log('=== Device Information ===');
    console.table(fullInfo.device);
    console.log('\n=== Display Info ===');
    console.table(fullInfo.display);
    console.log('\n=== Performance ===');
    console.table(fullInfo.performance);
    console.log('\n=== Storage ===');
    console.table(fullInfo.storage);
    console.log('\n=== Connection ===');
    console.table(fullInfo.connection);
    return fullInfo;
};

window.showDeviceBannerAgain = function() {
    showDeviceBanner();
};

window.getDeviceType = function() {
    const type = deviceDetector.deviceInfo.type;
    console.log(`Device Type: ${type.toUpperCase()}`);
    return type;
};

window.getScreenResolution = function() {
    const res = deviceDetector.displayInfo;
    console.log(`Resolution: ${res.resolution}`);
    console.log(`Orientation: ${res.orientation}`);
    console.log(`Pixel Ratio: ${res.pixelRatio}x`);
    return res;
};

window.getDeviceOS = function() {
    const os = deviceDetector.deviceInfo.os;
    const browser = deviceDetector.deviceInfo.browser;
    console.log(`Operating System: ${os}`);
    console.log(`Browser: ${browser}`);
    return { os, browser };
};

window.getNetworkConnection = function() {
    const conn = deviceDetector.connection;
    console.table(conn);
    return conn;
};

window.getDeviceStats = function() {
    const perf = deviceDetector.performance;
    console.log('CPU Cores:', perf.cores);
    if (perf.memory !== 'Not available') {
        console.table(perf.memory);
    }
    return perf;
};

console.log('%c📱 Device Detection System Active!', 'color: #ffff00; font-size: 14px; font-weight: bold;');
console.log('%cType getDeviceInfo() for complete device information', 'color: #00ff00; font-size: 12px;');
