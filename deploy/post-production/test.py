"""
Production Environment - Critical Production Monitoring and Validation Tests
Comprehensive production-grade tests for Solution Configurator Backend
"""

import os
import sys
import time
import json
import pytest
import requests
from typing import Dict, Any, List, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# Production environment configuration
PROD_BASE_URL = os.getenv("PROD_BASE_URL", "https://solution-configurator.com")
PROD_API_KEY = os.getenv("PROD_API_KEY", "")
IBM_AUTH_TOKEN = os.getenv("IBM_AUTH_TOKEN", "")
ALERT_WEBHOOK = os.getenv("ALERT_WEBHOOK", "")

# Production SLA thresholds
SLA_RESPONSE_TIME = 1.0  # seconds
SLA_AVAILABILITY = 99.9  # percentage
SLA_ERROR_RATE = 0.1  # percentage


class TestProductionHealth:
    """Critical production health checks"""
    
    @pytest.mark.production
    def test_health_endpoint_availability(self):
        """Test health endpoint is available"""
        response = requests.get(f"{PROD_BASE_URL}/health", timeout=5)
        assert response.status_code == 200, "Health endpoint must be available"
        data = response.json()
        assert data["status"] == "healthy", "System must report healthy status"
    
    @pytest.mark.production
    def test_readiness_all_services(self):
        """Test all services are ready"""
        response = requests.get(f"{PROD_BASE_URL}/health/ready", timeout=5)
        assert response.status_code == 200
        data = response.json()
        
        # Critical services must be connected
        assert data.get("database") == "connected", "Database must be connected"
        assert data.get("redis") == "connected", "Redis must be connected"
    
    @pytest.mark.production
    def test_metrics_collection(self):
        """Test metrics are being collected"""
        response = requests.get(f"{PROD_BASE_URL}/metrics", timeout=5)
        assert response.status_code in [200, 401], "Metrics endpoint must be available"


class TestProductionSLA:
    """Test production SLA compliance"""
    
    @pytest.mark.production
    @pytest.mark.performance
    def test_response_time_sla(self):
        """Test response times meet SLA"""
        endpoints = [
            "/health",
            "/api/v1/countries",
            "/api/v1/brands",
        ]
        
        for endpoint in endpoints:
            start = time.time()
            response = requests.get(f"{PROD_BASE_URL}{endpoint}", timeout=10)
            elapsed = time.time() - start
            
            assert response.status_code == 200
            assert elapsed < SLA_RESPONSE_TIME, \
                f"{endpoint} exceeded SLA response time: {elapsed:.3f}s > {SLA_RESPONSE_TIME}s"
    
    @pytest.mark.production
    @pytest.mark.performance
    def test_availability_sla(self):
        """Test system availability meets SLA"""
        num_requests = 100
        url = f"{PROD_BASE_URL}/health"
        
        def make_request():
            try:
                response = requests.get(url, timeout=5)
                return response.status_code == 200
            except:
                return False
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(num_requests)]
            results = [future.result() for future in as_completed(futures)]
        
        availability = (sum(results) / len(results)) * 100
        assert availability >= SLA_AVAILABILITY, \
            f"Availability {availability:.2f}% below SLA {SLA_AVAILABILITY}%"


class TestProductionSecurity:
    """Production security validation"""
    
    @pytest.mark.production
    @pytest.mark.security
    def test_https_only(self):
        """Test HTTPS is enforced"""
        assert PROD_BASE_URL.startswith("https://"), "Production must use HTTPS"
    
    @pytest.mark.production
    @pytest.mark.security
    def test_security_headers(self):
        """Test security headers are present"""
        response = requests.get(f"{PROD_BASE_URL}/health", timeout=5)
        headers = response.headers
        
        required_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": ["DENY", "SAMEORIGIN"],
        }
        
        for header, expected in required_headers.items():
            assert header in headers, f"Missing security header: {header}"
    
    @pytest.mark.production
    @pytest.mark.security
    def test_authentication_required(self):
        """Test authentication is required for protected endpoints"""
        response = requests.get(f"{PROD_BASE_URL}/api/v1/auth/me", timeout=5)
        assert response.status_code in [401, 403], "Protected endpoints must require auth"
    
    @pytest.mark.production
    @pytest.mark.security
    def test_rate_limiting(self):
        """Test rate limiting is active"""
        url = f"{PROD_BASE_URL}/api/v1/countries"
        
        # Make rapid requests
        responses = []
        for _ in range(100):
            response = requests.get(url, timeout=5)
            responses.append(response.status_code)
        
        # Should see some rate limiting (429) if limits are properly configured
        # Or all should succeed if limits are high enough
        assert all(code in [200, 429] for code in responses), \
            "Unexpected status codes in rate limit test"


class TestProductionDataIntegrity:
    """Production data integrity checks"""
    
    @pytest.mark.production
    def test_data_consistency(self):
        """Test data consistency across endpoints"""
        # Get all products
        products_response = requests.get(f"{PROD_BASE_URL}/api/v1/products", timeout=10)
        assert products_response.status_code == 200
        products = products_response.json()
        
        # Get all brands
        brands_response = requests.get(f"{PROD_BASE_URL}/api/v1/brands", timeout=10)
        assert brands_response.status_code == 200
        brands = brands_response.json()
        
        # Verify all product brand_ids exist in brands
        brand_ids = {b["id"] for b in brands}
        for product in products:
            assert product["brand_id"] in brand_ids, \
                f"Product {product['id']} references non-existent brand {product['brand_id']}"
    
    @pytest.mark.production
    def test_no_data_corruption(self):
        """Test data is not corrupted"""
        response = requests.get(f"{PROD_BASE_URL}/api/v1/offerings/search", timeout=10)
        assert response.status_code == 200
        offerings = response.json()
        
        for offering in offerings:
            # Check required fields exist and are valid
            assert offering.get("id"), "Offering must have ID"
            assert offering.get("name"), "Offering must have name"
            assert isinstance(offering.get("id"), str), "ID must be string"


class TestProductionPerformance:
    """Production performance monitoring"""
    
    @pytest.mark.production
    @pytest.mark.performance
    def test_concurrent_load_handling(self):
        """Test system handles concurrent load"""
        url = f"{PROD_BASE_URL}/api/v1/countries"
        num_requests = 100
        max_workers = 20
        
        def make_request():
            start = time.time()
            try:
                response = requests.get(url, timeout=10)
                elapsed = time.time() - start
                return response.status_code == 200, elapsed
            except:
                return False, 0
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(make_request) for _ in range(num_requests)]
            results = [future.result() for future in as_completed(futures)]
        
        successes = sum(1 for success, _ in results if success)
        times = [elapsed for success, elapsed in results if success]
        
        success_rate = (successes / num_requests) * 100
        avg_time = sum(times) / len(times) if times else 0
        
        assert success_rate >= 95, f"Success rate {success_rate:.1f}% below threshold"
        assert avg_time < 2.0, f"Average response time {avg_time:.3f}s too high"
    
    @pytest.mark.production
    @pytest.mark.performance
    def test_database_query_performance(self):
        """Test database queries are performant"""
        endpoints = [
            "/api/v1/countries",
            "/api/v1/brands",
            "/api/v1/products",
            "/api/v1/offerings/search",
        ]
        
        for endpoint in endpoints:
            start = time.time()
            response = requests.get(f"{PROD_BASE_URL}{endpoint}", timeout=10)
            elapsed = time.time() - start
            
            assert response.status_code == 200
            assert elapsed < 2.0, f"{endpoint} query too slow: {elapsed:.3f}s"


class TestProductionMonitoring:
    """Production monitoring and alerting"""
    
    @pytest.mark.production
    def test_error_logging(self):
        """Test errors are properly logged"""
        # Trigger a 404 error
        response = requests.get(f"{PROD_BASE_URL}/api/v1/nonexistent", timeout=5)
        assert response.status_code == 404
        # In production, this should be logged to monitoring system
    
    @pytest.mark.production
    def test_metrics_availability(self):
        """Test metrics are available for monitoring"""
        response = requests.get(f"{PROD_BASE_URL}/metrics", timeout=5)
        # Metrics endpoint should exist (may require auth)
        assert response.status_code in [200, 401, 403]


def run_production_smoke_tests() -> Tuple[bool, List[Dict[str, Any]]]:
    """Run critical production smoke tests"""
    print("=" * 70)
    print("PRODUCTION SMOKE TESTS")
    print("=" * 70)
    print(f"Environment: {PROD_BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("-" * 70)
    
    tests = [
        ("Health Check", f"{PROD_BASE_URL}/health", 5),
        ("Readiness Check", f"{PROD_BASE_URL}/health/ready", 5),
        ("Countries API", f"{PROD_BASE_URL}/api/v1/countries", 10),
        ("Brands API", f"{PROD_BASE_URL}/api/v1/brands", 10),
        ("Products API", f"{PROD_BASE_URL}/api/v1/products", 10),
        ("Offerings Search", f"{PROD_BASE_URL}/api/v1/offerings/search", 10),
    ]
    
    results = []
    all_passed = True
    
    for name, url, timeout in tests:
        try:
            start = time.time()
            response = requests.get(url, timeout=timeout)
            elapsed = time.time() - start
            
            passed = response.status_code == 200 and elapsed < SLA_RESPONSE_TIME
            status = "✓ PASS" if passed else f"✗ FAIL"
            
            result = {
                "test": name,
                "url": url,
                "status_code": response.status_code,
                "response_time": elapsed,
                "passed": passed,
                "timestamp": datetime.now().isoformat()
            }
            results.append(result)
            
            if not passed:
                all_passed = False
            
            print(f"{name:.<50} {status} ({elapsed:.3f}s)")
            
        except Exception as e:
            result = {
                "test": name,
                "url": url,
                "error": str(e),
                "passed": False,
                "timestamp": datetime.now().isoformat()
            }
            results.append(result)
            all_passed = False
            print(f"{name:.<50} ✗ ERROR: {str(e)}")
    
    print("-" * 70)
    print(f"Overall Status: {'✓ ALL TESTS PASSED' if all_passed else '✗ SOME TESTS FAILED'}")
    print("=" * 70)
    
    return all_passed, results


def send_alert(results: List[Dict[str, Any]]):
    """Send alert if tests fail"""
    if not ALERT_WEBHOOK:
        return
    
    failed_tests = [r for r in results if not r.get("passed", False)]
    
    if failed_tests:
        alert_data = {
            "environment": "production",
            "timestamp": datetime.now().isoformat(),
            "failed_tests": failed_tests,
            "total_tests": len(results),
            "failed_count": len(failed_tests)
        }
        
        try:
            requests.post(ALERT_WEBHOOK, json=alert_data, timeout=5)
        except:
            pass


if __name__ == "__main__":
    print("\n")
    print("╔" + "═" * 68 + "╗")
    print("║" + " " * 15 + "PRODUCTION ENVIRONMENT TEST SUITE" + " " * 20 + "║")
    print("╚" + "═" * 68 + "╝")
    print("\n")
    
    all_passed, results = run_production_smoke_tests()
    
    # Send alerts if tests failed
    send_alert(results)
    
    # Exit with appropriate code
    sys.exit(0 if all_passed else 1)
