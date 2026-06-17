server:
	hugo server -w --forceSyncStatic

create_post:
	hugo new --kind post posts/$(name)
