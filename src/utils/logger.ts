import chalk from "chalk";
import ora, { type Ora } from "ora";

export class Logger {
  private verbose: boolean;
  private spinner: Ora | null = null;

  constructor(verbose = false) {
    this.verbose = verbose;
  }

  info(message: string): void {
    console.log(chalk.blue("ℹ"), message);
  }

  success(message: string): void {
    console.log(chalk.green("✓"), message);
  }

  error(message: string): void {
    console.log(chalk.red("✗"), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow("⚠"), message);
  }

  debug(message: string): void {
    if (this.verbose) {
      console.log(chalk.gray("→"), message);
    }
  }

  startSpinner(message: string): void {
    this.spinner = ora(message).start();
  }

  updateSpinner(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  succeedSpinner(message?: string): void {
    if (this.spinner) {
      this.spinner.succeed(message);
      this.spinner = null;
    }
  }

  failSpinner(message?: string): void {
    if (this.spinner) {
      this.spinner.fail(message);
      this.spinner = null;
    }
  }

  stopSpinner(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
}