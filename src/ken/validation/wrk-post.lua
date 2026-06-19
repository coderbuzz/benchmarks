wrk.method = "POST"
wrk.body = [[{"someKey":"hello","someOtherKey":42,"requiredKey":[1,2,3],"nullableKey":null,"multipleTypesKey":true,"multipleRestrictedTypesKey":15,"enumKey":"John"}]]
wrk.headers["Content-Type"] = "application/json"
wrk.headers["x-foo"] = "test"
