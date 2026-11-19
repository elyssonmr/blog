server:
	hugo server -w --forceSyncStatic

create_post:
	hugo new --kind post posts/$(name)

quiz_server:
	HUGO_PARAMS_QUIZ_ENDPOINT=http://localhost:8787 hugo server -w --forceSyncStatic
