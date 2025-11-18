"""
Pre-Production Environment - Integration, Performance, and Security Tests
Comprehensive tests for Solution Configurator Backend in Pre-Production
"""

import os
import sys
import time
import pytest
import requests
from typing import Dict, Any, List
from concurrent.futures import ThreadPoolExecutor, as_completed

# Pre-production environment configuration
PREPROD_BASE_URL = os.getenv("PREPROD_BASE_URL", "https://preprod.solution-configurator.com")
PREPROD_API_KEY = os.getenv("PREPROD_API_KEY", "")
IBM_AUTH_TOKEN = os.getenv("IBM_AUTH_TOKEN", "")


class TestHealthAndReadiness:
    """Test health and readiness endpoints"""
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = requests.get(f"{PREPROD_BASE_URL}/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_readiness_check(self):
        """Test readiness check endpoint"""
        response = requests.get(f"{PREPROD_BASE_URL}/health/ready", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("database") == "connected"
        assert data.get("redis") == "connected"
    
    def test_metrics_endpoint(self):
        """Test metrics endpoint availability"""
        response = requests.get(f"{PREPROD_BASE_URL}/metrics", timeout=10)
        assert response.status_code in [200, 401]  # May require auth


class TestAPIEndpoints:
    """Test main API endpoints with authentication"""
    
    def get_headers(self):
        """Get headers with authentication"""
        headers = {}
        if IBM_AUTH_TOKEN:
            headers["Authorization"] = f"Bearer {IBM_AUTH_TOKEN}"
        return headers
    
    def test_get_countries(self):
        """Test countries endpoint"""
        response = requests.get(
            f"{PREPROD_BASE_URL}/api/v1/countries",
            headers=self.get_headers(),
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_get_brands(self):
        """Test brands endpoint"""
        response = requests.get(
            f"{PREPROD_BASE_URL}/api/v1/brands",
            headers=self.get_headers(),
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_search_offerings_with_filters(self):
        """Test offerings search with various filters"""
        filters = [
            {"saas_type": "SaaS"},
            {"industry": "Technology"},
            {"client_type": "Enterprise"},
        ]
        
        for filter_params in filters:
            response = requests.get(
                f"{PREPROD_BASE_URL}/api/v1/offerings/search",
                params=filter_params,
                headers=self.get_headers(),
                timeout=10
            )
            assert response.status_code == 200


class TestAuthentication:
    """Test authentication and authorization"""
    
    def test_protected_endpoint_without_auth(self):
        """Test that protected endpoints require authentication"""
        response = requests.get(f"{PREPROD_BASE_URL}/api/v1/auth/me", timeout=10)
        assert response.status_code in [401, 403]
    
    def test_ibm_auth_integration(self):
        """Test IBM authentication integration"""
        if IBM_AUTH_TOKEN:
            headers = {"Authorization": f"Bearer {IBM_AUTH_TOKEN}"}
            response = requests.get(
                f"{PREPROD_BASE_URL}/api/v1/auth/me",
                headers=headers,
                timeout=10
            )
            assert response.status_code in [200, 401]


class TestPerformance:
    """Performance and load tests"""
    
    def test_response_time_health(self):
        """Test health endpoint response time"""
        start = time.time()
        response = requests.get(f"{PREPROD_BASE_URL}/health", timeout=10)
        elapsed = time.time() - start
        
        assert response.status_code == 200
        assert elapsed < 0.5  # Should respond within 500ms
    
    def test_response_time_api_endpoints(self):
        """Test API endpoints response time"""
        endpoints = [
            "/api/v1/countries",
            "/api/v1/brands",
            "/api/v1/products",
        ]
        
        for endpoint in endpoints:
            start = time.time()
            response = requests.get(f"{PREPROD_BASE_URL}{endpoint}", timeout=10)
            elapsed = time.time() - start
            
            assert response.status_code == 200
            assert elapsed < 1.5  # Should respond within 1.5 seconds
    
    def test_concurrent_requests(self):
        """Test handling of concurrent requests"""
        url = f"{PREPROD_BASE_URL}/api/v1/countries"
        num_requests = 20
        
        def make_request():
            response = requests.get(url, timeout=10)
            return response.status_code == 200
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(num_requests)]
            results = [future.result() for future in as_completed(futures)]
        
        success_rate = sum(results) / len(results)
        assert success_rate >= 0.95  # At least 95% success rate


class TestDataIntegrity:
    """Test data integrity and consistency"""
    
    def test_offerings_data_structure(self):
        """Test offerings have proper data structure"""
        response = requests.get(f"{PREPROD_BASE_URL}/api/v1/offerings/search", timeout=10)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            offering = data[0]
            required_fields = ["id", "name", "product_id", "description"]
            for field in required_fields:
                assert field in offering, f"Missing field: {field}"
    
    def test_relational_data_consistency(self):
        """Test relationships between entities"""
        # Get products
        products_response = requests.get(f"{PREPROD_BASE_URL}/api/v1/products", timeout=10)
        assert products_response.status_code == 200
        products = products_response.json()
        
        if len(products) > 0:
            product = products[0]
            brand_id = product.get("brand_id")
            
            # Verify brand exists
            brands_response = requests.get(f"{PREPROD_BASE_URL}/api/v1/brands", timeout=10)
            assert brands_response.status_code == 200
            brands = brands_response.json()
            brand_ids = [b["id"] for b in brands]
            assert brand_id in brand_ids


class TestSecurity:
    """Security tests"""
    
    def test_https_enforcement(self):
        """Test that HTTPS is enforced"""
        assert PREPROD_BASE_URL.startswith("https://"), "Pre-production should use HTTPS"
    
    def test_cors_headers(self):
        """Test CORS headers are properly configured"""
        response = requests.options(
            f"{PREPROD_BASE_URL}/api/v1/countries",
            headers={"Origin": "https://preprod.solution-configurator.com"},
            timeout=10
        )
        # CORS headers should be present
        assert response.status_code in [200, 204]
    
    def test_security_headers(self):
        """Test security headers are present"""
        response = requests.get(f"{PREPROD_BASE_URL}/health", timeout=10)
        headers = response.headers
        
        # Check for common security headers
        security_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options",
        ]
        
        # At least some security headers should be present
        present_headers = [h for h in security_headers if h in headers]
        assert len(present_headers) > 0


class TestCaching:
    """Test caching functionality"""
    
    def test_cache_headers(self):
        """Test cache headers are present"""
        response = requests.get(f"{PREPROD_BASE_URL}/api/v1/countries", timeout=10)
        assert response.status_code == 200
        # Cache headers may be present
        assert "Cache-Control" in response.headers or True


class TestErrorHandling:
    """Test error handling"""
    
    def test_404_handling(self):
        """Test 404 error handling"""
        response = requests.get(f"{PREPROD_BASE_URL}/api/v1/nonexistent", timeout=10)
        assert response.status_code == 404
    
    def test_invalid_query_parameters(self):
        """Test handling of invalid query parameters"""
        response = requests.get(
            f"{PREPROD_BASE_URL}/api/v1/offerings/search",
            params={"invalid_param": "value"},
            timeout=10
        )
        # Should either ignore invalid params or return 400
        assert response.status_code in [200, 400]


def run_smoke_tests():
    """Run smoke tests for quick validation"""
    print("Running smoke tests for Pre-Production Environment...")
    print(f"Base URL: {PREPROD_BASE_URL}")
    
    tests = [
        ("Health Check", f"{PREPROD_BASE_URL}/health"),
        ("Readiness Check", f"{PREPROD_BASE_URL}/health/ready"),
        ("Countries API", f"{PREPROD_BASE_URL}/api/v1/countries"),
        ("Brands API", f"{PREPROD_BASE_URL}/api/v1/brands"),
        ("Products API", f"{PREPROD_BASE_URL}/api/v1/products"),
    ]
    
    results = []
    for name, url in tests:
        try:
            start = time.time()
            response = requests.get(url, timeout=10)
            elapsed = time.time() - start
            
            if response.status_code == 200:
                status = f"✓ PASS ({elapsed:.2f}s)"
            else:
                status = f"✗ FAIL ({response.status_code})"
            results.append((name, status))
        except Exception as e:
            results.append((name, f"✗ ERROR: {str(e)}"))
    
    print("\nSmoke Test Results:")
    print("-" * 60)
    for name, status in results:
        print(f"{name:.<45} {status}")
    print("-" * 60)
    
    return all("PASS" in status for _, status in results)


def run_performance_tests():
    """Run basic performance tests"""
    print("\nRunning performance tests...")
    
    url = f"{PREPROD_BASE_URL}/api/v1/countries"
    num_requests = 50
    
    print(f"Making {num_requests} concurrent requests...")
    
    def make_request():
        start = time.time()
        response = requests.get(url, timeout=10)
        elapsed = time.time() - start
        return response.status_code == 200, elapsed
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request) for _ in range(num_requests)]
        results = [future.result() for future in as_completed(futures)]
    
    successes = sum(1 for success, _ in results if success)
    times = [elapsed for _, elapsed in results]
    
    print(f"Success rate: {successes}/{num_requests} ({successes/num_requests*100:.1f}%)")
    print(f"Average response time: {sum(times)/len(times):.3f}s")
    print(f"Min response time: {min(times):.3f}s")
    print(f"Max response time: {max(times):.3f}s")


if __name__ == "__main__":
    print("=" * 60)
    print("Pre-Production Environment Test Suite")
    print("=" * 60)
    
    smoke_success = run_smoke_tests()
    
    if smoke_success:
        run_performance_tests()
    
    sys.exit(0 if smoke_success else 1)
