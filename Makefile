server:
	hugo server -w

create_post:
	hugo new --kind post posts/$(name)
