# HaaS Platform - Test Execution Script
# Run all tests with coverage reporting
# Usage: python run_tests.py [options]

import sys
import subprocess
from pathlib import Path

def run_tests(test_type="all", coverage=True, verbose=True):
    """
    Run test suite with specified options.
    
    Args:
        test_type: "all", "unit", "integration", "auth", "inmetro", etc.
        coverage: Whether to generate coverage report
        verbose: Verbose output
    """
    cmd = ["pytest"]
    
    # Add verbosity
    if verbose:
        cmd.append("-v")
    
    # Add coverage
    if coverage:
        cmd.extend(["--cov=app", "--cov-report=html", "--cov-report=term"])
    
    # Add test markers
    if test_type != "all":
        cmd.extend(["-m", test_type])
    
    # Run tests
    print(f"🧪 Running {test_type} tests...")
    print(f"Command: {' '.join(cmd)}")
    print("=" * 60)
    
    result = subprocess.run(cmd, cwd=Path(__file__).parent)
    
    if result.returncode == 0:
        print("\n✅ All tests passed!")
        if coverage:
            print("\n📊 Coverage report: htmlcov/index.html")
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run HaaS Platform tests")
    parser.add_argument(
        "--type",
        default="all",
        choices=["all", "unit", "integration", "auth", "inmetro",
                 "monitoring", "documents"],
        help="Type of tests to run"
    )
    parser.add_argument(
        "--no-coverage",
        action="store_true",
        help="Skip coverage reporting"
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Less verbose output"
    )
    
    args = parser.parse_args()
    
    run_tests(
        test_type=args.type,
        coverage=not args.no_coverage,
        verbose=not args.quiet
    )
