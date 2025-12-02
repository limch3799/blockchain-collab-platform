package com.s401.moas.project.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "position")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Position {

    @Id
    @Column(name = "id", columnDefinition = "INT UNSIGNED")  // id로 변경!
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "category_id", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Integer categoryId;

    @Column(name = "position_name", nullable = false, length = 30)
    private String positionName;
}