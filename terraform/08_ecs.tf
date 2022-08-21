# ECS
resource "aws_ecs_cluster" "production" {
  name = "${var.ecs_cluster_name}-cluster"
}

resource "aws_launch_configuration" "ecs" {
  name                        = "${var.ecs_cluster_name}-cluster"
  image_id                    = lookup(var.amis, var.region)
  instance_type               = var.instance_type
  security_groups             = [aws_security_group.ecs.id]
  iam_instance_profile        = aws_iam_instance_profile.ecs.name
  key_name                    = aws_key_pair.production.key_name
  associate_public_ip_address = true
  user_data                   = "#!/bin/bash\necho ECS_CLUSTER='${var.ecs_cluster_name}-cluster' > /etc/ecs/ecs.config"
}


resource "aws_ecs_task_definition" "app" {
  family = "django-app"
  container_definitions = jsonencode([{
    "name" : "django-app",
    "image" : "${var.docker_image_url_django}",
    "essential" : true,
    "cpu" : 10,
    "memory" : 512,
    "links" : [],
    "portMappings" : [{
      "containerPort" : 8000,
      "hostPort" : 0,
      "protocol" : "tcp"
    }],
    "command" : ["gunicorn", "-w", "3", "-b", ":8000", "hello_django.wsgi:application"],
    "environment" : [],
    "mountPoints" : [{
      "containerPath" : "/usr/src/app/staticfiles",
      "sourceVolume" : "static_volume"
    }],
    "logConfiguration" : {
      "logDriver" : "awslogs",
      "options" : {
        "awslogs-group" : "/ecs/django-app",
        "awslogs-region" : "${var.region}",
        "awslogs-stream-prefix" : "django-app-log-stream"
      }
    }
    },
    {
      "name" : "nginx",
      "image" : "${var.docker_image_url_nginx}",
      "essential" : true,
      "cpu" : 10,
      "memory" : 128,
      "links" : ["django-app"],
      "portMappings" : [{
        "containerPort" : 80,
        "hostPort" : 0,
        "protocol" : "tcp"
      }],
      "volumesFrom" : [{
        "sourceContainer" : "django-app"
      }],
      "mountPoints" : [{
        "containerPath" : "/usr/src/app/staticfiles",
        "sourceVolume" : "static_volume"
      }],
      "logConfiguration" : {
        "logDriver" : "awslogs",
        "options" : {
          "awslogs-group" : "/ecs/nginx",
          "awslogs-region" : "${var.region}",
          "awslogs-stream-prefix" : "nginx-log-stream"
        }
      }
    }
  ])

  volume {
    name = "static_volume"
    docker_volume_configuration {
      scope         = "task"
      autoprovision = false
      driver        = "local"
    }
  }
}

resource "aws_ecs_service" "production" {
  name            = "${var.ecs_cluster_name}-service"
  cluster         = aws_ecs_cluster.production.id
  iam_role        = aws_iam_role.ecs-service-role.arn
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.app_count
  depends_on      = [aws_alb_listener.ecs-alb-http-listener, aws_iam_role_policy.ecs-service-role-policy]


  load_balancer {
    target_group_arn = aws_alb_target_group.default-target-group.arn
    container_name   = "nginx"
    container_port   = 80
  }

}
