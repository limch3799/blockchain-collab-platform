package com.s401.moas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableJpaAuditing
@EnableAsync
@EnableRetry
@EnableScheduling
@SpringBootApplication
public class MoasApplication {

	public static void main(String[] args) {
		SpringApplication.run(MoasApplication.class, args);
	}

}
