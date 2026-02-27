package org.zkbar;

import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.shim.ChaincodeException;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class TranscriptContractTest {

    private Context ctx;
    private ChaincodeStub stub;
    private TranscriptContract contract;

    @BeforeEach
    public void setup() {
        ctx = mock(Context.class);
        stub = mock(ChaincodeStub.class);
        when(ctx.getStub()).thenReturn(stub);
        contract = new TranscriptContract();
    }

    @Test
    public void testCreateTranscriptSuccess() {
        String studentId = "STUDENT_123";
        // Simulate transcript doesn't exist
        when(stub.getStringState(studentId)).thenReturn("");

        StudentRecord record = contract.createTranscript(
                ctx, studentId, "did:zkbar:123", "B.Sc", 3.5, "2024", "QmHash", "OxHash", "ISSUED"
        );

        assertNotNull(record);
        assertEquals(studentId, record.getStudentId());
        verify(stub).putStringState(eq(studentId), anyString());
    }

    @Test
    public void testCreateTranscriptAlreadyExists() {
        String studentId = "STUDENT_123";
        // Simulate transcript exists
        when(stub.getStringState(studentId)).thenReturn("{\"studentId\":\"STUDENT_123\"}");

        assertThrows(ChaincodeException.class, () -> {
            contract.createTranscript(
                    ctx, studentId, "did:zkbar:123", "B.Sc", 3.5, "2024", "QmHash", "OxHash", "ISSUED"
            );
        });
    }

    @Test
    public void testQueryTranscriptSuccess() {
        String studentId = "STUDENT_123";
        String dummyJson = "{\"studentId\":\"STUDENT_123\",\"degreeName\":\"B.Sc Computer Science\"}";
        when(stub.getStringState(studentId)).thenReturn(dummyJson);

        StudentRecord record = contract.queryTranscript(ctx, studentId);
        
        assertNotNull(record);
        assertEquals(studentId, record.getStudentId());
        assertEquals("B.Sc Computer Science", record.getDegreeName());
    }

    @Test
    public void testQueryTranscriptNotFound() {
        String studentId = "STUDENT_999";
        when(stub.getStringState(studentId)).thenReturn(null);

        assertThrows(ChaincodeException.class, () -> {
            contract.queryTranscript(ctx, studentId);
        });
    }
}
