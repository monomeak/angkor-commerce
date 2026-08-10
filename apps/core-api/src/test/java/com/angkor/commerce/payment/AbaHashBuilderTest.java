package com.angkor.commerce.payment;

import static org.assertj.core.api.Assertions.assertThat;

import com.angkor.commerce.payment.gateway.aba.AbaHashBuilder;
import com.angkor.commerce.payment.gateway.aba.AbaQrRequest;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import org.junit.jupiter.api.Test;

class AbaHashBuilderTest {

    private final AbaHashBuilder builder = new AbaHashBuilder();

    /**
     * Locks the algorithm itself: HMAC-SHA512 over UTF-8 bytes, Base64-encoded.
     * The expected value is the textbook HMAC-SHA512 vector, reproducible with:
     *
     * <pre>
     * printf '%s' 'The quick brown fox jumps over the lazy dog' \
     *   | openssl dgst -sha512 -hmac 'key' -binary | base64
     * </pre>
     */
    @Test
    void matchesKnownHmacSha512Vector() {
        String hash = builder.hash(List.of("The quick brown fox jumps over the lazy dog"), "key");

        assertThat(hash).isEqualTo(
            "tCrwkFe6weLUFwjkipAuCbX/fxKrQopP6GZTxz3SSPuC+UilSfe3kaW0GRXuTR7Dk1NX5OIxclDQNyr6Lr7rOg=="
        );
    }

    /**
     * Golden vector for the create-QR field order, so a reorder of
     * {@link AbaQrRequest#hashOrder()} fails here instead of at PayWay.
     *
     * NOTE: these are made-up credentials, not ABA's published example — the
     * expected hash was produced by openssl over the concatenated payload, so
     * it pins our encoding and field order but cannot prove the order matches
     * ABA's spec. When the integration pack's worked example is available,
     * swap in its values, api key and expected hash: the assertion then also
     * validates the order against ABA.
     */
    @Test
    void matchesGoldenVectorForCreateQrHashOrder() {
        AbaQrRequest qr = new AbaQrRequest(
            "20210123234559", // req_time
            "onlinesshop24", // merchant_id
            "00002894", // tran_id
            "5000", // amount (KHR — whole numbers)
            "W3sibmFtZSI6Ik9yZGVyIDAwMDAyODk0IiwicXVhbnRpdHkiOiIxIn1d", // items, base64 JSON
            "Sokmeak", // first_name
            "Sarenn", // last_name
            "", // email
            "010123456", // phone
            "purchase", // purchase_type
            "abapay_khqr", // payment_option
            "aHR0cHM6Ly9hcGkuZXhhbXBsZS5jb20vd2ViaG9va3MvYWJh", // callback_url, base64
            "", // return_deeplink
            "KHR", // currency
            "", // custom_fields
            "", // return_params
            "", // payout
            "30", // lifetime
            "" // qr_image_template
        );

        String hash = builder.hash(qr.hashOrder(), "test_api_key_123");

        assertThat(hash).isEqualTo(
            "CigC8VUYYuHV9IFC9y4y75dOVCRiGgGCKAdmlLvlOT1xSuASV6wLtxhsYvbO8xX+XvsZE4Pg7c0Szbq/QEOMog=="
        );
    }

    @Test
    void encodesValuesAsUtf8() {
        String hash = builder.hash(List.of("សួស្ដីពិភពលោក"), "key");

        assertThat(hash).isEqualTo(
            "DbJXuZ9v0my/BUsavI2txr/IKINu8NQtLyeCgfo9e3oRWbWw1iI8TGY4Dpln73pFB5Y3zMxRbsv9T89JfmQaXw=="
        );
    }

    @Test
    void joinsValuesWithoutASeparator() {
        String single = builder.hash(List.of("abc"), "key");

        assertThat(builder.hash(List.of("a", "b", "c"), "key")).isEqualTo(single);
        assertThat(builder.hash(List.of("ab", "c"), "key")).isEqualTo(single);
    }

    @Test
    void nullsKeepTheirPosition() {
        String withEmpty = builder.hash(List.of("a", "", "c"), "key");
        String withNull = builder.hash(Arrays.asList("a", null, "c"), "key");

        assertThat(withNull).isEqualTo(withEmpty);
    }

    /** Trailing optional fields are empty strings, so they add nothing to the payload. */
    @Test
    void trailingEmptyValuesDoNotChangeTheHash() {
        assertThat(builder.hash(List.of("a", "b", "", "", ""), "key")).isEqualTo(builder.hash(List.of("a", "b"), "key"));
    }

    @Test
    void valueOrderChangesTheHash() {
        assertThat(builder.hash(List.of("aa", "bb"), "key")).isNotEqualTo(builder.hash(List.of("bb", "aa"), "key"));
    }

    @Test
    void apiKeyChangesTheHash() {
        assertThat(builder.hash(List.of("a", "b"), "key-one")).isNotEqualTo(builder.hash(List.of("a", "b"), "key-two"));
    }

    @Test
    void producesBase64OfA512BitDigest() {
        String hash = builder.hash(List.of("20210123234559", "onlinesshop24"), "key");

        assertThat(Base64.getDecoder().decode(hash)).hasSize(64);
    }
}
