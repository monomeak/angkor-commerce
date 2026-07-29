package com.angkor.commerce.customer;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum CustomerType {
	@JsonProperty("individual")
	INDIVIDUAL,

	@JsonProperty("business")
	BUSINESS
}
