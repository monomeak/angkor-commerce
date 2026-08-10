package com.angkor.commerce.common.storage;

import com.angkor.commerce.common.exception.StorageException;
import jakarta.validation.ValidationException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import javax.imageio.IIOException;
import lombok.RequiredArgsConstructor;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
@RequiredArgsConstructor
public class ThumbnailGenerator {

    private final ImageProperties imageProperties;

    public byte[] generate(MultipartFile file) {
        try (InputStream in = file.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Thumbnails.of(in)
                .size(imageProperties.maxWidth(), imageProperties.maxHeight())
                .keepAspectRatio(true)
                .outputFormat("jpg")
                .outputQuality(imageProperties.quality())
                .toOutputStream(out);

            return out.toByteArray();
        } catch (IllegalArgumentException | IIOException e) {
            throw new ValidationException("The uploaded file is not a valid image");
        } catch (IOException e) {
            throw new StorageException("Failed to generate thumbail", e);
        }
    }
}
