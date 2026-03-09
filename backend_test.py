import requests
import sys
import json
from datetime import datetime
import time

class FitnessAppTester:
    def __init__(self, base_url="https://fit-dad-forge.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_workout_id = None
        self.created_tip_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_signup(self):
        """Test user signup"""
        timestamp = int(time.time())
        test_data = {
            "email": f"test.user.{timestamp}@example.com",
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data=test_data
        )
        
        if success:
            # Extract session token from cookies if available
            print("   Signup successful - user created")
        
        return success

    def test_login(self):
        """Test user login"""
        timestamp = int(time.time())
        test_data = {
            "email": f"test.user.{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=test_data
        )
        
        return success

    def test_session_exchange(self):
        """Test Google OAuth session exchange"""
        test_data = {
            "session_id": "fake_session_id_for_testing"
        }
        
        success, response = self.run_test(
            "Session Exchange (OAuth)",
            "POST",
            "auth/session",
            400,  # Expected to fail with fake session
            data=test_data
        )
        
        # This should fail with fake session, which is expected
        if not success:
            print("   Expected failure with fake session ID")
            return True
        return False

    def test_auth_me_without_token(self):
        """Test /auth/me without authentication"""
        success, response = self.run_test(
            "Get User Info (No Auth)",
            "GET",
            "auth/me",
            401
        )
        return success

    def test_auth_me_with_token(self):
        """Test /auth/me with authentication"""
        if not self.session_token:
            print("❌ No session token available for testing")
            return False
            
        success, response = self.run_test(
            "Get User Info (With Auth)",
            "GET",
            "auth/me",
            200
        )
        
        if success and response:
            self.user_id = response.get('user_id')
            print(f"   User ID: {self.user_id}")
        
        return success

    def test_get_workouts(self):
        """Test getting workouts"""
        success, response = self.run_test(
            "Get Workouts",
            "GET",
            "workouts",
            200
        )
        return success

    def test_create_workout(self):
        """Test creating a workout"""
        test_data = {
            "title": "Test Push-ups",
            "description": "A test workout for push-ups",
            "duration_minutes": 15,
            "difficulty": "Beginner",
            "category": "Strength"
        }
        
        success, response = self.run_test(
            "Create Workout",
            "POST",
            "workouts",
            200,
            data=test_data
        )
        
        if success and response:
            self.created_workout_id = response.get('workout_id')
            print(f"   Created workout ID: {self.created_workout_id}")
        
        return success

    def test_complete_workout(self):
        """Test completing a workout"""
        if not self.created_workout_id:
            print("❌ No workout ID available for completion test")
            return False
            
        test_data = {
            "workout_id": self.created_workout_id
        }
        
        success, response = self.run_test(
            "Complete Workout",
            "POST",
            "workouts/complete",
            200,
            data=test_data
        )
        
        if success and response:
            print(f"   Points earned: {response.get('points')}")
            print(f"   Level: {response.get('level')}")
            print(f"   Badge: {response.get('badge')}")
        
        return success

    def test_workout_progress(self):
        """Test getting workout progress"""
        success, response = self.run_test(
            "Get Workout Progress",
            "GET",
            "workouts/progress",
            200
        )
        
        if success and response:
            print(f"   Total workouts: {response.get('total_workouts_completed')}")
            print(f"   Current level: {response.get('current_level')}")
            print(f"   Progress: {response.get('progress_percentage')}%")
        
        return success

    def test_get_nutrition_tips(self):
        """Test getting nutrition tips"""
        success, response = self.run_test(
            "Get Nutrition Tips",
            "GET",
            "nutrition",
            200
        )
        return success

    def test_create_nutrition_tip(self):
        """Test creating a nutrition tip"""
        test_data = {
            "title": "Test Hydration Tip",
            "content": "Drink plenty of water throughout the day for optimal performance.",
            "category": "Hydration"
        }
        
        success, response = self.run_test(
            "Create Nutrition Tip",
            "POST",
            "nutrition",
            200,
            data=test_data
        )
        
        if success and response:
            self.created_tip_id = response.get('tip_id')
            print(f"   Created tip ID: {self.created_tip_id}")
        
        return success

    def test_get_chat_messages(self):
        """Test getting chat messages"""
        success, response = self.run_test(
            "Get Chat Messages",
            "GET",
            "chat/messages",
            200
        )
        return success

    def test_logout(self):
        """Test user logout"""
        success, response = self.run_test(
            "User Logout",
            "POST",
            "auth/logout",
            200
        )
        
        if success:
            self.session_token = None
            print("   Session token cleared")
        
        return success

    def create_test_session_manually(self):
        """Create a test session using MongoDB directly for testing"""
        print("\n🔧 Creating test session manually...")
        
        import subprocess
        timestamp = int(time.time())
        user_id = f"test-user-{timestamp}"
        session_token = f"test_session_{timestamp}"
        email = f"test.user.{timestamp}@example.com"
        
        mongo_script = f"""
        use('test_database');
        var userId = '{user_id}';
        var sessionToken = '{session_token}';
        var email = '{email}';
        
        db.users.insertOne({{
          user_id: userId,
          email: email,
          name: 'Test User',
          picture: 'https://via.placeholder.com/150',
          created_at: new Date().toISOString(),
          level: 1,
          workouts_completed: 0,
          points: 0,
          current_badge: 'Beginner'
        }});
        
        db.user_sessions.insertOne({{
          user_id: userId,
          session_token: sessionToken,
          expires_at: new Date(Date.now() + 7*24*60*60*1000),
          created_at: new Date()
        }});
        
        print('Session token: ' + sessionToken);
        print('User ID: ' + userId);
        """
        
        try:
            result = subprocess.run(['mongosh', '--eval', mongo_script], 
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                self.session_token = session_token
                self.user_id = user_id
                print(f"✅ Test session created successfully")
                print(f"   Session token: {session_token}")
                print(f"   User ID: {user_id}")
                return True
            else:
                print(f"❌ Failed to create test session: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error creating test session: {str(e)}")
            return False

def main():
    print("🚀 Starting DadWeapon Fitness App Backend Testing")
    print("=" * 60)
    
    tester = FitnessAppTester()
    
    # Test basic endpoints without authentication
    print("\n📋 PHASE 1: Unauthenticated Endpoints")
    tester.test_auth_me_without_token()
    tester.test_signup()
    tester.test_login()
    tester.test_session_exchange()
    
    # Create test session for authenticated tests
    print("\n📋 PHASE 2: Setting up Test Session")
    if not tester.create_test_session_manually():
        print("❌ Cannot proceed without test session")
        return 1
    
    # Test authenticated endpoints
    print("\n📋 PHASE 3: Authenticated Endpoints")
    tester.test_auth_me_with_token()
    tester.test_get_workouts()
    tester.test_create_workout()
    tester.test_complete_workout()
    tester.test_workout_progress()
    tester.test_get_nutrition_tips()
    tester.test_create_nutrition_tip()
    tester.test_get_chat_messages()
    tester.test_logout()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        failed = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())