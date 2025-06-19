{
	"info": {
		"_postman_id": "19662ae7-fc95-462d-a2e6-0930832ecdba",
		"name": "E Mendate Sabpaisa",
		"description": "Postman collection for CRUD operations for all models",
		"schema": "https://schema.getpostman.com/json/collection/v2.0.0/collection.json",
		"_exporter_id": "39226862",
		"_collection_link": "https://sabpaisa-4141.postman.co/workspace/Sabpaisa~45cb1214-e6e6-416c-90eb-711ae93fd26c/collection/39226862-19662ae7-fc95-462d-a2e6-0930832ecdba?action=share&source=collection_link&creator=39226862"
	},
	"item": [
		{
			"name": "Merchant",
			"item": [
				{
					"name": "Create Merchant",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"merchant_id\": \"12345\",\n  \"name\": \"Test Merchant\",\n  \"token\": \"abcd1234\",\n  \"merchant_code\": \"TM001\",\n  \"address\": \"123 Test Street\",\n  \"status\": \"active\"\n}"
						},
						"url": "{{baseUrl}}v1/merchants"
					},
					"response": []
				},
				{
					"name": "Get Merchants",
					"request": {
						"method": "GET",
						"header": [],
						"url": "{{baseUrl}}v1/merchants"
					},
					"response": []
				},
				{
					"name": "Get Merchant",
					"request": {
						"method": "GET",
						"header": [],
						"url": "{{baseUrl}}v1/merchants/5"
					},
					"response": []
				},
				{
					"name": "Update Merchant",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"name\": \"Updated Merchant\",\n  \"address\": \"456 Updated Street\",\n  \"status\": \"inactive\"\n}"
						},
						"url": "{{baseUrl}}v1/merchants/12345"
					},
					"response": []
				},
				{
					"name": "Delete Merchant",
					"request": {
						"method": "DELETE",
						"header": [],
						"url": "{{baseUrl}}v1/merchants/12345"
					},
					"response": []
				}
			]
		},
		{
			"name": "Merchant Slab",
			"item": [
				{
					"name": "Create Merchant Slab",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"merchant_id\": \"12345\",\n  \"slab_from\": 100.0,\n  \"slab_to\": 500.0,\n  \"base_amount\": 200.0,\n  \"emi_amount\": 20.0,\n  \"emi_tenure\": 12,\n  \"processing_fee\": 5.0,\n  \"effective_date\": \"2025-01-01T00:00:00Z\",\n  \"expiry_date\": \"2025-12-31T23:59:59Z\",\n  \"remarks\": \"Test slab\",\n  \"status\": \"active\"\n}"
						},
						"url": "{{baseUrl}}v1/merchantslabs"
					},
					"response": []
				},
				{
					"name": "Get Merchant Slabs",
					"request": {
						"method": "GET",
						"header": [],
						"url": "{{baseUrl}}v1/merchantslabs"
					},
					"response": []
				},
				{
					"name": "Update Merchant Slab",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"remarks\": \"Updated remarks\",\n  \"status\": \"inactive\"\n}"
						},
						"url": "{{baseUrl}}v1/merchantslabs/1"
					},
					"response": []
				},
				{
					"name": "Delete Merchant Slab",
					"request": {
						"method": "DELETE",
						"header": [],
						"url": "{{baseUrl}}v1/merchantslabs/1"
					},
					"response": []
				}
			]
		},
		{
			"name": "User",
			"item": [
				{
					"name": "Create User",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"user_id\": \"U123\",\n  \"name\": \"John Doe\",\n  \"mobile\": \"1234567890\",\n  \"email\": \"john.doe@example.com\",\n  \"pan\": \"ABCDE1234F\",\n  \"telephone\": \"0123456789\"\n}"
						},
						"url": "{{baseUrl}}v1/users"
					},
					"response": []
				},
				{
					"name": "Get Users",
					"request": {
						"method": "GET",
						"header": [],
						"url": "{{baseUrl}}v1/users/U123"
					},
					"response": []
				},
				{
					"name": "Update User",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"name\": \"Jane Doe\",\n  \"email\": \"jane.doe@example.com\",\n  \"mobile\": \"9876543210\"\n}"
						},
						"url": "{{baseUrl}}v1/users/U123"
					},
					"response": []
				},
				{
					"name": "Delete User",
					"request": {
						"method": "DELETE",
						"header": [],
						"url": "{{baseUrl}}v1/users/U123"
					},
					"response": []
				}
			]
		},
		{
			"name": "Transaction",
			"item": [
				{
					"name": "Create Transaction",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"transaction_id\": \"T123\",\n  \"user_id\": \"U123\",\n  \"merchant_id\": \"12345\",\n  \"txn_id\": \"TX123\",\n  \"monthly_emi\": 1500.50,\n  \"start_date\": \"2025-01-01T00:00:00Z\",\n  \"end_date\": \"2025-12-31T23:59:59Z\",\n  \"purpose\": \"Test purpose\",\n  \"max_amount\": 50000.00\n}"
						},
						"url": "{{baseUrl}}v1/transactions"
					},
					"response": []
				},
				{
					"name": "Get Transactions",
					"request": {
						"method": "GET",
						"header": [],
						"url": "{{baseUrl}}v1/transactions"
					},
					"response": []
				},
				{
					"name": "Update Transaction",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"purpose\": \"Updated purpose\",\n  \"max_amount\": 60000.00\n}"
						},
						"url": "{{baseUrl}}v1/transactions/T123"
					},
					"response": []
				},
				{
					"name": "Delete Transaction",
					"request": {
						"method": "DELETE",
						"header": [],
						"url": "{{baseUrl}}v1/transactions/T123"
					},
					"response": []
				}
			]
		},
		{
			"name": "User Mandate",
			"item": [
				{
					"name": "Create User Mandate",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"transaction_id\": \"T123\",\n  \"user_id\": \"U123\",\n  \"amount\": 5000.00,\n  \"due_date\": \"2025-01-15T00:00:00Z\",\n  \"paid_date\": \"2025-01-10T00:00:00Z\"\n}"
						},
						"url": "{{baseUrl}}v1/mandates"
					},
					"response": []
				},
				{
					"name": "Get User Mandates",
					"request": {
						"method": "GET",
						"header": [],
						"url": "{{baseUrl}}v1/mandates"
					},
					"response": []
				},
				{
					"name": "Update User Mandate",
					"request": {
						"method": "PUT",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"amount\": 5500.00,\n  \"due_date\": \"2025-01-20T00:00:00Z\"\n}"
						},
						"url": "{{baseUrl}}v1/mandates/1"
					},
					"response": []
				},
				{
					"name": "Delete User Mandate",
					"request": {
						"method": "DELETE",
						"header": [],
						"url": "{{baseUrl}}v1/mandates/1"
					},
					"response": []
				}
			]
		},
		{
			"name": "External APIs",
			"item": [
				{
					"name": "Calculate Mandate Details",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}v1/external/calculate-mandate?encReq={{encryptedRequest}}",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"v1",
								"external",
								"calculate-mandate"
							],
							"query": [
								{
									"key": "encReq",
									"value": "{{encryptedRequest}}",
									"description": "Encrypted request containing merchant_id and payment_amount"
								}
							]
						},
						"description": "Calculate mandate details based on merchant ID and payment amount. The request parameters are encrypted using AES-GCM encryption."
					},
					"response": [
						{
							"name": "Success Response",
							"originalRequest": {
								"method": "GET",
								"header": [],
								"url": {
									"raw": "{{baseUrl}}v1/external/calculate-mandate?encReq={{encryptedRequest}}",
									"host": [
										"{{baseUrl}}"
									],
									"path": [
										"v1",
										"external",
										"calculate-mandate"
									],
									"query": [
										{
											"key": "encReq",
											"value": "{{encryptedRequest}}"
										}
									]
								}
							},
							"status": "OK",
							"code": 200,
							"_postman_previewlanguage": "json",
							"header": [
								{
									"key": "Content-Type",
									"value": "application/json"
								}
							],
							"cookie": [],
							"body": "{\n  \"meta\": {\n    \"status\": true,\n    \"message\": \"Mandate details calculated successfully\",\n    \"code\": 200\n  },\n  \"data\": {\n    \"encryptedResponse\": \"encrypted_response_string_here\"\n  }\n}"
						}
					]
				}
			]
		}
	],
	"event": [
		{
			"listen": "prerequest",
			"script": {
				"type": "text/javascript",
				"packages": {},
				"exec": [
					""
				]
			}
		},
		{
			"listen": "test",
			"script": {
				"type": "text/javascript",
				"packages": {},
				"exec": [
					""
				]
			}
		}
	],
	"variable": [
		{
			"key": "baseUrl",
			"value": "http://localhost:3000/",
			"type": "string"
		},
		{
			"key": "encryptedRequest",
			"value": "your_encrypted_request_string_here",
			"type": "string",
			"description": "AES-GCM encrypted request containing merchant_id and payment_amount parameters"
		}
	]
}