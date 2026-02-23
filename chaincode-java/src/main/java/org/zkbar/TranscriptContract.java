package org.zkbar;

import com.owlike.genson.Genson;
import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contact;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.License;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ChaincodeException;
import org.hyperledger.fabric.shim.ChaincodeStub;

@Contract(
        name = "TranscriptContract",
        info = @Info(
                title = "ZKBAR-V Transcript Contract",
                description = "Smart Contract for managing Academic Credentials",
                version = "0.0.1-SNAPSHOT",
                license = @License(
                        name = "Apache 2.0 License",
                        url = "http://www.apache.org/licenses/LICENSE-2.0.html"),
                contact = @Contact(
                        email = "registrar@university.edu",
                        name = "ZKBAR Registrar",
                        url = "https://zkbar.university.edu")))
@Default
public class TranscriptContract implements ContractInterface {

    private final Genson genson = new Genson();

    private enum TranscriptErrors {
        TRANSCRIPT_NOT_FOUND,
        TRANSCRIPT_ALREADY_EXISTS
    }

    /**
     * Initialize the ledger with some dummy data for testing.
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public void initLedger(final Context ctx) {
        ChaincodeStub stub = ctx.getStub();
        
        // Check if we already initialized to avoid overwriting
        // (In a real production system, you might skip this or use a flag)
        
        createTranscript(ctx, "STUDENT_001", "did:zkbar:12345", "B.Sc Computer Science", 3.8, "2024", "QmHash123...", "SHA256_HASH_XYZ", "ISSUED");
        createTranscript(ctx, "STUDENT_002", "did:zkbar:67890", "B.A. History", 3.5, "2024", "QmHash456...", "SHA256_HASH_ABC", "ISSUED");
        
        System.out.println("Ledger initialized with dummy data.");
    }

    /**
     * Issue a new Transcript (Create Asset).
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public StudentRecord createTranscript(final Context ctx, 
                                          final String studentId, 
                                          final String did,
                                          final String degreeName, 
                                          final double gpa, 
                                          final String graduationYear, 
                                          final String ipfsCid, 
                                          final String originalHash, 
                                          final String status) {
        
        ChaincodeStub stub = ctx.getStub();

        if (transcriptExists(ctx, studentId)) {
            String errorMessage = String.format("Transcript for Student ID %s already exists", studentId);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, TranscriptErrors.TRANSCRIPT_ALREADY_EXISTS.toString());
        }

        StudentRecord record = new StudentRecord(studentId, did, degreeName, gpa, graduationYear, ipfsCid, originalHash, status);
        
        // Serialize the object to JSON and store it in the World State
        String recordJson = genson.serialize(record);
        stub.putStringState(studentId, recordJson);

        return record;
    }

    /**
     * Read a Transcript by Student ID.
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public StudentRecord queryTranscript(final Context ctx, final String studentId) {
        ChaincodeStub stub = ctx.getStub();
        String recordJson = stub.getStringState(studentId);

        if (recordJson == null || recordJson.isEmpty()) {
            String errorMessage = String.format("Transcript for Student ID %s does not exist", studentId);
            throw new ChaincodeException(errorMessage, TranscriptErrors.TRANSCRIPT_NOT_FOUND.toString());
        }

        return genson.deserialize(recordJson, StudentRecord.class);
    }

    /**
     * Helper function to check existence.
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public boolean transcriptExists(final Context ctx, final String studentId) {
        ChaincodeStub stub = ctx.getStub();
        String recordJson = stub.getStringState(studentId);
        return (recordJson != null && !recordJson.isEmpty());
    }
}
