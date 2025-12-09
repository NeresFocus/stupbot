const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

class Logger {
  timestamp() {
    return new Date().toISOString();
  }

  info(msg, ...args) {
    console.log(`${colors.blue}[INFO]${colors.reset} [${this.timestamp()}]`, msg, ...args);
  }

  success(msg, ...args) {
    console.log(`${colors.green}[SUCCESS]${colors.reset} [${this.timestamp()}]`, msg, ...args);
  }

  warn(msg, ...args) {
    console.warn(`${colors.yellow}[WARN]${colors.reset} [${this.timestamp()}]`, msg, ...args);
  }

  error(msg, ...args) {
    console.error(`${colors.red}[ERROR]${colors.reset} [${this.timestamp()}]`, msg, ...args);
  }
}

module.exports = new Logger();
