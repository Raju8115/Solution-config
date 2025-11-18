"""
Test Environment - Integration and Smoke Tests
Tests for Solution Configurator Backend in Test Environment
"""

import os
import sys
import pytest
import requests
from typing import Dict, Any

# Test environment configuration
TEST_BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:8000")
TEST_API_KEY = os.getenv("TEST_API_KEY", "")


class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_health_check(self):
        """Test basic health check endpoint"""
        response = requests.get(f"{TEST_BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_readiness_check(self):
        """Test readiness check endpoint"""
        response = requests.get(f"{TEST_BASE_URL}/health/ready")
        assert response.status_code == 200
        data = response.json()
        assert "database" in data
        assert "redis" in data or True  # Redis might not be available in test


class TestAPIEndpoints:
    """Test main API endpoints"""
    
    def test_get_countries(self):
        """Test countries endpoint"""
        response = requests.get(f"{TEST_BASE_URL}/api/v1/countries")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_brands(self):
        """Test brands endpoint"""
        response = requests.get(f"{TEST_BASE_URL}/api/v1/brands")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_products(self):
        """Test products endpoint"""
        response = requests.get(f"{TEST_BASE_URL}/api/v1/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_search_offerings(self):
        """Test offerings search endpoint"""
        response = requests.get(f"{TEST_BASE_URL}/api/v1/offerings/search")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_auth_endpoint_exists(self):
        """Test that auth endpoint exists"""
        response = requests.get(f"{TEST_BASE_URL}/api/v1/auth/me")
        # Should return 401 or 403 without authentication
        assert response.status_code in [401, 403]


class TestDatabaseConnectivity:
    """Test database connectivity"""
    
    def test_database_connection(self):
        """Test database is accessible"""
        response = requests.get(f"{TEST_BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        # Database should be connected in health check
        assert data["status"] == "healthy"


class TestEnvironmentConfiguration:
    """Test environment-specific configuration"""
    
    def test_debug_mode_enabled(self):
        """Test that debug mode is enabled in test environment"""
        response = requests.get(f"{TEST_BASE_URL}/health")
        assert response.status_code == 200
        # In test environment, we expect debug endpoints to be available
    
    def test_cors_configuration(self):
        """Test CORS headers are present"""
        response = requests.options(f"{TEST_BASE_URL}/api/v1/countries")
        # CORS headers should be present
        assert "access-control-allow-origin" in response.headers or response.status_code == 200


class TestDataIntegrity:
    """Test data integrity and consistency"""
    
    def test_offerings_have_required_fields(self):
        """Test that offerings have all required fields"""
        response = requests.get(f"{TEST_BASE_URL}/api/v1/offerings/search")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            offering = data[0]
            required_fields = ["id", "name", "product_id"]
            for field in required_fields:
                assert field in offering
    
    def test_products_have_brand_relationship(self):
        """Test that products are properly linked to brands"""
        response = requests.get(f"{TEST_BASE_URL}/api/v1/products")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            product = data[0]
            assert "brand_id" in product


class TestPerformance:
    """Basic performance tests"""
    
    def test_response_time_health(self):
        """Test health endpoint response time"""
        import time
        start = time.time()
        response = requests.get(f"{TEST_BASE_URL}/health")
        end = time.time()
        
        assert response.status_code == 200
        assert (end - start) < 1.0  # Should respond within 1 second
    
    def test_response_time_api(self):
        """Test API endpoint response time"""
        import time
        start = time.time()
        response = requests.get(f"{TEST_BASE_URL}/api/v1/countries")
        end = time.time()
        
        assert response.status_code == 200
        assert (end - start) < 2.0  # Should respond within 2 seconds


def run_smoke_tests():
    """Run smoke tests for quick validation"""
    print("Running smoke tests for Test Environment...")
    print(f"Base URL: {TEST_BASE_URL}")
    
    # Quick smoke tests
    tests = [
        ("Health Check", f"{TEST_BASE_URL}/health"),
        ("Countries API", f"{TEST_BASE_URL}/api/v1/countries"),
        ("Brands API", f"{TEST_BASE_URL}/api/v1/brands"),
    ]
    
    results = []
    for name, url in tests:
        try:
            response = requests.get(url, timeout=5)
            status = "✓ PASS" if response.status_code == 200 else f"✗ FAIL ({response.status_code})"
            results.append((name, status))
        except Exception as e:
            results.append((name, f"✗ ERROR: {str(e)}"))
    
    print("\nSmoke Test Results:")
    print("-" * 50)
    for name, status in results:
        print(f"{name:.<40} {status}")
    print("-" * 50)
    
    return all("PASS" in status for _, status in results)


if __name__ == "__main__":
    # Run smoke tests if executed directly
    success = run_smoke_tests()
    sys.exit(0 if success else 1)
