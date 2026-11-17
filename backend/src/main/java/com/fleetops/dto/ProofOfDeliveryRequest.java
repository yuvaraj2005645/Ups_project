package com.fleetops.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProofOfDeliveryRequest {
    @NotBlank(message = "Receiver name is required")
    private String receiverName;

    private String receiverPhone;
    private String receiverRelationship;
    private String proofPhotoBase64;

    @NotBlank(message = "Signature is required")
    private String signatureBase64;
    private String remarks;
}
