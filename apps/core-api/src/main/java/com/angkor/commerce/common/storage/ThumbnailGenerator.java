package com.angkor.commerce.common.storage;

import com.angkor.commerce.common.exception.StorageException;
import jakarta.validation.ValidationException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import javax.imageio.IIOException;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class ThumbnailGenerator {

    //[HACK]: load from properties or env instead later
    private static final int MAX_WIDTH = 400;
    private static final int MAX_HEIGHT = 400;
    private static final double QUALITY = 0.8;

    public byte[] generate(MultipartFile file) {
        try (InputStream in = file.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Thumbnails.of(in)
                .size(MAX_WIDTH, MAX_HEIGHT)
                .keepAspectRatio(true)
                .outputFormat("jpg")
                .outputQuality(QUALITY)
                .toOutputStream(out);

            return out.toByteArray();
        } catch (IllegalArgumentException | IIOException e) {
            throw new ValidationException("The uploaded file is not a valid image");
        } catch (IOException e) {
            throw new StorageException("Failed to generate thumbail", e);
        }
    }
}
